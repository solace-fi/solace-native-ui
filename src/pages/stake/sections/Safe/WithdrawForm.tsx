import React from 'react'
import styled from 'styled-components'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { Tab } from '../../types/Tab'
import InputSection from '../InputSection'
import { LockData } from '../../../../constants/types'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { accurateMultiply, convertSciNotaToPrecise, filterAmount, formatAmount } from '../../../../utils/formatting'
import { BigNumber } from 'ethers'
import { useInputAmount } from '../../../../hooks/useInputAmount'
import { useXSLocker } from '../../../../hooks/useXSLocker'
import { useWallet } from '../../../../context/WalletManager'
import { FunctionName } from '../../../../constants/enums'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'
import { StyledForm } from '../../atoms/StyledForm'

export default function WithdrawForm({ lock }: { lock: LockData }): JSX.Element {
  const { handleToast, handleContractCallError, isAppropriateAmount, gasConfig } = useInputAmount()
  const { withdrawFromLock } = useXSLocker()
  const { account } = useWallet()

  const [inputValue, setInputValue] = React.useState('0')
  const [rangeValue, setRangeValue] = React.useState('0')

  const callWithdrawFromLock = async () => {
    if (!account) return
    let type = FunctionName.WITHDRAW_IN_PART_FROM_LOCK
    const isMax = parseUnits(inputValue, 18).eq(lock.unboostedAmount)
    if (isMax) {
      type = FunctionName.WITHDRAW_FROM_LOCK
    }
    await withdrawFromLock(account, [lock.xsLockID], gasConfig, isMax ? undefined : parseUnits(inputValue, 18))
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callWithdrawFromLock', err, type))
  }

  const inputOnChange = (value: string) => {
    const filtered = filterAmount(value, inputValue)
    const formatted = formatAmount(filtered)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    if (parseUnits(formatted, 18).gt(lock.unboostedAmount)) return

    setRangeValue(accurateMultiply(filtered, 18))
    setInputValue(filtered)
  }

  const rangeOnChange = (value: string, convertFromSciNota = true) => {
    setInputValue(formatUnits(BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`), 18))
    setRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  const setMax = () => rangeOnChange(lock.unboostedAmount.toString())

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <InformationBox type={InfoBoxType.info} text="Withdrawal is available only when the lockup period ends." />
      <StyledForm>
        <InputSection
          tab={Tab.WITHDRAW}
          value={inputValue}
          onChange={(e) => inputOnChange(e.target.value)}
          setMax={setMax}
        />
        <StyledSlider
          value={rangeValue}
          onChange={(e) => rangeOnChange(e.target.value)}
          min={1}
          max={lock.unboostedAmount.toString()}
        />
        <Button
          secondary
          info
          noborder
          disabled={!isAppropriateAmount(inputValue, 18, lock.unboostedAmount) || lock.timeLeft.toNumber() > 0}
          onClick={callWithdrawFromLock}
        >
          Withdraw
        </Button>
      </StyledForm>
    </div>
  )
}
