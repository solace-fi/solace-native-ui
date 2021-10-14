/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    RiskBackingCapitalPool function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import { parseUnits } from '@ethersproject/units'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { CP_ROI, BKPT_6 } from '../../constants'
import { FunctionName } from '../../constants/enums'

/* import components */
import { Content } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Card } from '../atoms/Card'
import { FormRow, FormCol } from '../atoms/Form'
import { StyledTooltip } from '../molecules/Tooltip'

/* import hooks */
import { useCapitalPoolSize, useUserVaultDetails } from '../../hooks/useVault'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { floatUnits, truncateBalance } from '../../utils/formatting'

interface RiskBackingCapitalPoolProps {
  openModal: (func: FunctionName, modalTitle: string) => void
}

export const RiskBackingCapitalPool: React.FC<RiskBackingCapitalPoolProps> = ({ openModal }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { errors } = useGeneral()
  const { account } = useWallet()
  const { userVaultAssets, userVaultShare } = useUserVaultDetails()
  const capitalPoolSize = useCapitalPoolSize()
  const { width } = useWindowDimensions()
  const { currencyDecimals } = useNetwork()

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Content>
      <Text bold t1 mb={0}>
        Underwriting Pool{' '}
        {/* <StyledTooltip
          id={'underwriting-pool'}
          tip={'Provide capital here for Solace to underwrite the risks and fulfill claims for policies'}
        />{' '} */}
      </Text>
      <Text t4 pb={10}>
        This pool allows Solace to back risks and fulfill claims for policies
      </Text>
      {width > BKPT_6 ? (
        <Table isHighlight textAlignCenter>
          <TableHead>
            <TableRow>
              {account ? <TableHeader width={100}>Your Assets</TableHeader> : null}
              <TableHeader width={100}>Total Assets</TableHeader>
              <TableHeader width={100}>ROI (1Y)</TableHeader>
              {account ? <TableHeader width={130}>Your Vault Share</TableHeader> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow light>
              {account ? (
                <TableData t3 width={100}>
                  {truncateBalance(userVaultAssets, 2)}
                </TableData>
              ) : null}
              <TableData t3 width={100}>
                {truncateBalance(floatUnits(parseUnits(capitalPoolSize, currencyDecimals), currencyDecimals), 2)}
              </TableData>
              <TableData t3 width={100}>
                {CP_ROI}
              </TableData>
              {account ? <TableData t3 width={130}>{`${truncateBalance(userVaultShare, 2)}%`}</TableData> : null}
              {account ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200} style={{ float: 'right' }}>
                    <Button
                      light
                      disabled={errors.length > 0}
                      onClick={() => openModal(FunctionName.DEPOSIT_ETH, 'Deposit')}
                    >
                      Deposit
                    </Button>
                    <Button
                      light
                      disabled={errors.length > 0}
                      onClick={() => openModal(FunctionName.WITHDRAW_ETH, 'Withdraw')}
                    >
                      Withdraw
                    </Button>
                  </TableDataGroup>
                </TableData>
              ) : null}
            </TableRow>
          </TableBody>
        </Table>
      ) : (
        // tablet version
        <Card isHighlight>
          {account && (
            <FormRow>
              <FormCol light>Your Assets:</FormCol>
              <FormCol light t2>
                {truncateBalance(userVaultAssets, 2)}
              </FormCol>
            </FormRow>
          )}
          <FormRow>
            <FormCol light>Total Assets:</FormCol>
            <FormCol light t2>
              {truncateBalance(floatUnits(parseUnits(capitalPoolSize, currencyDecimals), currencyDecimals), 2)}
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol light>ROI:</FormCol>
            <FormCol light t2>
              {CP_ROI}
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol light>Your Vault Share:</FormCol>
            <FormCol light t2>{`${truncateBalance(userVaultShare, 2)}%`}</FormCol>
          </FormRow>
          <ButtonWrapper isColumn>
            <Button
              widthP={100}
              disabled={errors.length > 0}
              onClick={() => openModal(FunctionName.DEPOSIT_ETH, 'Deposit')}
              light
            >
              Deposit
            </Button>
            <Button
              widthP={100}
              disabled={errors.length > 0}
              onClick={() => openModal(FunctionName.WITHDRAW_ETH, 'Withdraw')}
              light
            >
              Withdraw
            </Button>
          </ButtonWrapper>
        </Card>
      )}
    </Content>
  )
}
