import { ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'

export const useFluxMegaOracle = () => {
  const { keyContracts } = useContracts()
  const { fluxMegaOracle } = useMemo(() => keyContracts, [keyContracts])

  const valueOfTokens = async (token: string, amount: BigNumber): Promise<BigNumber> => {
    if (!fluxMegaOracle) return ZERO
    try {
      const usdValue = await fluxMegaOracle.valueOfTokens(token, amount)
      return usdValue
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  return { valueOfTokens }
}
