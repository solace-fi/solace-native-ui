import { BigNumber, Contract } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import React, { createContext, useMemo, useState, useContext, useEffect, useCallback } from 'react'
import { SOLACE_TOKEN } from '../../constants/mappings/token'
import { ReadToken } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useBatchBalances } from '../../hooks/balance/useBalance'
import { ERC20_ABI } from '../../constants/abi'
import { useTokenAllowance, useTokenApprove } from '../../hooks/contract/useToken'
import SOLACE from '../../constants/abi/SOLACE.json'
import { useInputAmount } from '../../hooks/internal/useInputAmount'
import { isAddress } from '../../utils'
import { fixed, formatAmount } from '../../utils/formatting'
import { coinsMap } from '../../constants/mappings/whitelistedTokensForNative'
import { TokenSelectionModal } from '../../components/organisms/TokenSelectionModal'

type LockContextType = {
  intrface: {
    transactionLoading: boolean
    balancesLoading: boolean
    handleTransactionLoading: (setLoading: boolean) => void
  }
  paymentCoins: {
    batchBalanceData: (ReadToken & { balance: BigNumber })[]
    coinsOpen: boolean
    setCoinsOpen: (value: boolean) => void
    depositApproval: boolean
    approveCPM: (tokenAddr: string, amount?: BigNumber) => void
  }
  input: {
    enteredDeposit: string
    isAcceptableDeposit: boolean
    selectedCoin: ReadToken
    handleSelectedCoin: (coin: string) => void
  }
}

const LockContext = createContext<LockContextType>({
  intrface: {
    transactionLoading: false,
    balancesLoading: false,
    handleTransactionLoading: () => undefined,
  },
  paymentCoins: {
    batchBalanceData: [],
    coinsOpen: false,
    setCoinsOpen: () => undefined,
    depositApproval: false,
    approveCPM: () => undefined,
  },
  input: {
    enteredDeposit: '',
    selectedCoin: {
      address: SOLACE_TOKEN.address[1],
      ...SOLACE_TOKEN.constants,
    },
    handleSelectedCoin: () => undefined,
    isAcceptableDeposit: false,
  },
})

const LockManager: React.FC = (props) => {
  const { activeNetwork } = useNetwork()
  const { signer } = useProvider()

  const {
    amount: enteredDeposit,
    isAppropriateAmount: isAppropriateDeposit,
    handleInputChange: handleEnteredDeposit,
  } = useInputAmount()

  const [coinsOpen, setCoinsOpen] = useState(false)
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false)

  const coinOptions = useMemo(
    () => [
      {
        address: SOLACE_TOKEN.address[activeNetwork.chainId],
        ...SOLACE_TOKEN.constants,
      },
      ...(coinsMap[activeNetwork.chainId] ?? []),
    ],
    [activeNetwork]
  )
  const { loading: balancesLoading, batchBalances } = useBatchBalances(coinOptions)

  const [selectedCoin, setSelectedCoin] = useState<ReadToken>(coinOptions[0])

  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const depositApproval = useTokenAllowance(
    contractForAllowance,
    spenderAddress,
    enteredDeposit && enteredDeposit != '.' ? parseUnits(enteredDeposit, selectedCoin.decimals).toString() : '0'
  )
  const { approve } = useTokenApprove(setTransactionLoading)

  const batchBalanceData = useMemo(() => {
    if (batchBalances.length !== coinOptions.length) return []
    return batchBalances.map((b, i) => {
      return { balance: b.balance, ...coinOptions[i] }
    })
  }, [batchBalances, coinOptions])

  const isAcceptableDeposit = useMemo(() => {
    const selectedBalance = batchBalances.find((b) => b.addr === selectedCoin.address)
    if (!selectedBalance) return false
    return isAppropriateDeposit(enteredDeposit, selectedCoin.decimals, selectedBalance.balance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalances, enteredDeposit, selectedCoin.address, selectedCoin.decimals])

  const handleSelectedCoin = useCallback(
    (addr: string) => {
      const coin = coinOptions.find((c) => c.address === addr)
      if (coin) {
        if (coin.decimals < selectedCoin.decimals) {
          handleEnteredDeposit(fixed(formatAmount(enteredDeposit), coin.decimals).toString())
        }
        setSelectedCoin(coin)
      }
    },
    [coinOptions, enteredDeposit, selectedCoin.decimals, handleEnteredDeposit]
  )

  const handleTransactionLoading = useCallback((setLoading: boolean) => {
    setTransactionLoading(setLoading)
  }, [])

  const approveCPM = useCallback(
    async (tokenAddr: string, amount?: BigNumber) => {
      if (!spenderAddress || !isAddress(tokenAddr) || !isAddress(spenderAddress)) return
      await approve(tokenAddr, ERC20_ABI, spenderAddress, amount)
    },
    [spenderAddress, approve]
  )

  useEffect(() => {
    setSelectedCoin(coinOptions[0])
  }, [coinOptions])

  useEffect(() => {
    let abi = null
    switch (selectedCoin.symbol) {
      case 'SOLACE':
        abi = SOLACE
        break
      default:
        abi = ERC20_ABI
    }
    setContractForAllowance(new Contract(selectedCoin.address, abi, signer))
  }, [selectedCoin, signer])

  useEffect(() => {
    setSpenderAddress(null)
  }, [activeNetwork, signer])

  const value = useMemo<LockContextType>(
    () => ({
      intrface: {
        transactionLoading,
        balancesLoading,
        handleTransactionLoading,
      },
      paymentCoins: {
        batchBalanceData,
        coinsOpen,
        setCoinsOpen,
        depositApproval,
        approveCPM,
      },
      input: {
        enteredDeposit,
        selectedCoin,
        handleSelectedCoin,
        isAcceptableDeposit,
      },
    }),
    [
      handleTransactionLoading,
      approveCPM,
      batchBalanceData,
      coinsOpen,
      setCoinsOpen,
      depositApproval,
      enteredDeposit,
      selectedCoin,
      handleSelectedCoin,
      isAcceptableDeposit,
      transactionLoading,
      balancesLoading,
    ]
  )
  return (
    <LockContext.Provider value={value}>
      <TokenSelectionModal
        show={coinsOpen}
        balanceData={batchBalanceData.map((item) => {
          return { ...item, price: 0 }
        })}
        handleSelectedCoin={handleSelectedCoin}
        handleCloseModal={() => setCoinsOpen(false)}
      />
      {props.children}
    </LockContext.Provider>
  )
}

export function useLockContext(): LockContextType {
  return useContext(LockContext)
}

export default LockManager
