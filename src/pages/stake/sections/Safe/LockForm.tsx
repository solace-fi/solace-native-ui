import React from 'react'
import styled from 'styled-components'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'
import { Tab } from '../../types/Tab'
import InputSection from '../InputSection'
import { LockData } from '../../../../constants/types'
import { DAYS_PER_YEAR } from '../../../../constants'
import { useXSLocker } from '../../../../hooks/useXSLocker'
import { useInputAmount } from '../../../../hooks/useInputAmount'
import { FunctionName } from '../../../../constants/enums'
import { BigNumber } from 'ethers'
import { useProvider } from '../../../../context/ProviderManager'
import { SmallBox } from '../../../../components/atoms/Box'
import { Text } from '../../../../components/atoms/Typography'
import { getExpiration } from '../../../../utils/time'

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 30px;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  width: 521px;
`

export default function LockForm({ lock }: { lock: LockData }): JSX.Element {
  const { latestBlock } = useProvider()
  const { extendLock } = useXSLocker()
  const { handleToast, handleContractCallError, gasConfig } = useInputAmount()

  const [inputValue, setInputValue] = React.useState('0')

  const callExtendLock = async () => {
    if (!latestBlock || !inputValue || inputValue == '0') return
    const seconds = latestBlock.timestamp + parseInt(inputValue) * 86400
    await extendLock(lock.xsLockID, BigNumber.from(seconds), gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callExtendLock', err, FunctionName.INCREASE_LOCK_AMOUNT))
  }

  const inputOnChange = (value: string) => {
    const filtered = value.replace(/[^0-9]*/g, '')
    if (parseFloat(filtered) <= DAYS_PER_YEAR * 4 || filtered == '') {
      setInputValue(filtered)
    }
  }
  const rangeOnChange = (value: string) => {
    setInputValue(value)
  }

  const setMax = () => setInputValue(`${DAYS_PER_YEAR * 4}`)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <InformationBox
        type={InfoBoxType.info}
        text="You may extend or start the lockup period of this safe. Note that you cannot withdraw funds during a lockup period."
      />
      <StyledForm>
        <InputSection
          tab={Tab.LOCK}
          value={inputValue}
          onChange={(e) => inputOnChange(e.target.value)}
          setMax={setMax}
        />
        <StyledSlider
          value={inputValue}
          onChange={(e) => rangeOnChange(e.target.value)}
          min={0}
          max={DAYS_PER_YEAR * 4}
        />
        {
          <SmallBox transparent collapse={!inputValue || inputValue == '0'} m={0} p={0}>
            <Text dark>Lockup End Date: {getExpiration(parseInt(inputValue))}</Text>
          </SmallBox>
        }

        <Button secondary info noborder disabled={!inputValue || inputValue == '0'} onClick={callExtendLock}>
          {lock.timeLeft.toNumber() > 0 ? `Extend Lockup` : `Start Lockup`}
        </Button>
      </StyledForm>
    </div>
  )
}
