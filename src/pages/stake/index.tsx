/*

    Table of Contents:

    import packages
    import managers
    import components
    import hooks

    Stake 
      hooks

*/

/* import packages */
import React, { useState, useEffect } from 'react'
import { parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { FunctionName } from '../../constants/enums'

/* import components */
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Card } from '../../components/atoms/Card'
import { FormCol, FormRow } from '../../components/atoms/Form'
import { Input } from '../../components/atoms/Input'
import { Content, FlexCol, HorizRule } from '../../components/atoms/Layout'
import { ModalCell } from '../../components/atoms/Modal'
import { Text } from '../../components/atoms/Typography'
import { HeroContainer, MultiTabIndicator } from '../../components/atoms/Layout'
import { WalletConnectButton } from '../../components/molecules/WalletConnectButton'

/* import hooks */
import { useSolaceBalance, useXSolaceBalance } from '../../hooks/useBalance'
import { useXSolace } from '../../hooks/useXSolace'
import { useInputAmount } from '../../hooks/useInputAmount'

/* import utils */
import { getUnit, truncateBalance } from '../../utils/formatting'

function Stake(): any {
  /*************************************************************************************

    hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const [isStaking, setIsStaking] = useState<boolean>(true)
  const { solaceBalance } = useSolaceBalance()
  const { xSolaceBalance } = useXSolaceBalance()
  const {
    gasConfig,
    amount,
    isAppropriateAmount,
    handleToast,
    handleContractCallError,
    handleInputChange,
    setMax,
    resetAmount,
  } = useInputAmount()
  const { stake, unstake } = useXSolace()
  const { account } = useWallet()
  const { currencyDecimals } = useNetwork()

  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)

  const callStakeSigned = async () => {
    await stake(
      parseUnits(amount, currencyDecimals),
      `${truncateBalance(amount)} ${getUnit(FunctionName.STAKE)}`,
      gasConfig
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callStakeSigned', err, FunctionName.STAKE))
  }

  const callUnstake = async () => {
    await unstake(
      parseUnits(amount, currencyDecimals),
      `${truncateBalance(amount)} ${getUnit(FunctionName.UNSTAKE)}`,
      gasConfig
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callUnstake', err, FunctionName.UNSTAKE))
  }

  const getAssetBalanceByFunc = (): BigNumber => {
    return isStaking ? parseUnits(solaceBalance, currencyDecimals) : parseUnits(xSolaceBalance, currencyDecimals)
  }

  const _setMax = () => {
    setMax(getAssetBalanceByFunc(), currencyDecimals)
  }

  useEffect(() => {
    setIsAcceptableAmount(isAppropriateAmount(amount, currencyDecimals, getAssetBalanceByFunc()))
  }, [amount, isStaking])

  useEffect(() => {
    resetAmount()
  }, [isStaking])

  return (
    <>
      {!account ? (
        <HeroContainer>
          <Text bold t1 textAlignCenter>
            Please connect wallet to begin staking
          </Text>
          <WalletConnectButton info welcome secondary />
        </HeroContainer>
      ) : (
        <Content>
          <FlexCol>
            <Card style={{ margin: 'auto' }}>
              <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', position: 'relative' }}>
                <MultiTabIndicator style={{ left: isStaking ? '0' : '50%' }} />
                <ModalCell
                  pt={5}
                  pb={10}
                  pl={0}
                  pr={0}
                  onClick={() => setIsStaking(true)}
                  style={{ cursor: 'pointer', justifyContent: 'center' }}
                >
                  <Text t1 info={isStaking}>
                    Stake
                  </Text>
                </ModalCell>
                <ModalCell
                  pt={5}
                  pb={10}
                  pl={0}
                  pr={0}
                  onClick={() => setIsStaking(false)}
                  style={{ cursor: 'pointer', justifyContent: 'center' }}
                >
                  <Text t1 info={!isStaking}>
                    Unstake
                  </Text>
                </ModalCell>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Input
                  width={200}
                  mt={20}
                  mb={5}
                  minLength={1}
                  maxLength={79}
                  autoComplete="off"
                  autoCorrect="off"
                  inputMode="decimal"
                  placeholder="0.0"
                  textAlignCenter
                  type="text"
                  onChange={(e) => handleInputChange(e.target.value)}
                  value={amount}
                />
                <Button ml={10} pt={4} pb={4} pl={8} pr={8} width={70} height={30} onClick={_setMax}>
                  MAX
                </Button>
              </div>
              <FormRow mt={20} mb={10}>
                <FormCol>
                  <Text>Unstaked Balance</Text>
                </FormCol>
                <FormCol>
                  <Text info>{solaceBalance} SOLACE</Text>
                </FormCol>
              </FormRow>
              <FormRow mb={10}>
                <FormCol>
                  <Text>Staked Balance</Text>
                </FormCol>
                <FormCol>
                  <Text info nowrap>
                    {xSolaceBalance} xSOLACE
                  </Text>
                </FormCol>
              </FormRow>
              <HorizRule />
              <FormRow>
                <FormCol>
                  <Text bold>Next Reward Amount</Text>
                </FormCol>
                <FormCol>
                  <Text bold info nowrap>
                    0.02 xSOLACE
                  </Text>
                </FormCol>
              </FormRow>
              <FormRow>
                <FormCol>
                  <Text bold>Next Reward Yield</Text>
                </FormCol>
                <FormCol>
                  <Text bold info nowrap>
                    35%
                  </Text>
                </FormCol>
              </FormRow>
              <FormRow>
                <FormCol>
                  <Text bold>ROI (5-Day Rate)</Text>
                </FormCol>
                <FormCol>
                  <Text bold info nowrap>
                    75%
                  </Text>
                </FormCol>
              </FormRow>
              <ButtonWrapper>
                <Button
                  widthP={100}
                  info
                  disabled={!isAcceptableAmount || haveErrors}
                  onClick={isStaking ? callStakeSigned : callUnstake}
                >
                  {isStaking ? 'Stake' : 'Unstake'}
                </Button>
              </ButtonWrapper>
            </Card>
          </FlexCol>
        </Content>
      )}
    </>
  )
}

export default Stake
