import React, { useEffect, useState } from 'react'
import { formatUnits } from 'ethers/lib/utils'
import { Button } from '../../../components/atoms/Button'
import { StyledArrowDropDown } from '../../../components/atoms/Icon'
import { StyledSlider } from '../../../components/atoms/Input'
import { Flex } from '../../../components/atoms/Layout'
import { GrayBox } from '../../../components/molecules/GrayBox'
import { InputSection, SmallerInputSection } from '../../../components/molecules/InputSection'
import { LoaderText } from '../../../components/molecules/LoaderText'
import { BKPT_7, BKPT_5 } from '../../../constants'
import { FunctionName, InfoBoxType, Tab } from '../../../constants/enums'
import { VoteLockData } from '../../../constants/types'
import { StyledForm } from '../atoms/StyledForm'
import InformationBox from '../components/InformationBox'
import { useGeneral } from '../../../context/GeneralManager'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'
import { ZERO_ADDRESS } from '@solace-fi/sdk-nightly'
import { isAddress } from '../../../utils'
import { useUwLockVoting } from '../../../hooks/lock/useUwLockVoting'
import { useWeb3React } from '@web3-react/core'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { Modal } from '../../../components/molecules/Modal'
import { Text } from '../../../components/atoms/Typography'
import { shortenAddress } from '../../../utils/formatting'
import { CopyButton } from '../../../components/molecules/CopyButton'

export const DelegateModal = ({
  show,
  handleCloseModal,
}: {
  show: boolean
  handleCloseModal: () => void
}): JSX.Element => {
  const { account } = useWeb3React()
  const { rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  const { delegateOf, setDelegate } = useUwLockVoting()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const [currentDelegate, setCurrentDelegate] = useState(ZERO_ADDRESS)
  const [stagingDelegate, setStagingDelegate] = useState('')
  const [isValid, setIsValid] = useState(false)

  const inputOnChange = (value: string) => {
    setStagingDelegate(value)
  }

  const callSetDelegate = async () => {
    if (stagingDelegate === currentDelegate) return
    await setDelegate(stagingDelegate)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callSetDelegate', err, FunctionName.SET_DELEGATE))
  }

  useEffect(() => {
    if (stagingDelegate.length == 0) setIsValid(false)
    if (stagingDelegate == ZERO_ADDRESS) setIsValid(false)
    if (!isAddress(stagingDelegate)) setIsValid(false)
  }, [stagingDelegate])

  useEffect(() => {
    const getMyDelegate = async () => {
      if (!account) {
        setCurrentDelegate(ZERO_ADDRESS)
        return
      }
      const delegate = await delegateOf(account)
      setCurrentDelegate(delegate)
    }
    getMyDelegate()
  }, [delegateOf, account])

  return (
    <Modal isOpen={show} handleClose={handleCloseModal} modalTitle={'Set Delegate'}>
      <Flex col gap={10}>
        {isAddress(currentDelegate) && currentDelegate != ZERO_ADDRESS && (
          <Flex col gap={5}>
            <Text t5s>Current Delegate</Text>
            <Flex gap={10} between stretch>
              <Text t2 autoAlignVertical>
                {shortenAddress(currentDelegate)}
              </Text>
              <CopyButton toCopy={currentDelegate} objectName={''} />
            </Flex>
          </Flex>
        )}
        <Flex col gap={10}>
          <SmallerInputSection
            placeholder={'New Address'}
            value={stagingDelegate}
            onChange={(e) => inputOnChange(e.target.value)}
          />
          <Flex>
            <Button error disabled={currentDelegate == ZERO_ADDRESS} onClick={callSetDelegate} widthP={100}>
              Remove
            </Button>
            <Button secondary info noborder disabled={!isValid} onClick={callSetDelegate} widthP={100}>
              Save
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Modal>
  )
}
