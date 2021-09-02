/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    MyClaims function
      custom hooks
      contract functions
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useMemo } from 'react'

/* import packages */
import { formatUnits } from '@ethersproject/units'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { CardContainer, Card } from '../atoms/Card'
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Heading1, Text } from '../atoms/Typography'
import { Content } from '../atoms/Layout'

/* import constants */
import { FunctionName, TransactionCondition, Unit } from '../../constants/enums'
import { GAS_LIMIT } from '../../constants'
import { ClaimDetails } from '../../constants/types'

/* import hooks */
import { useGetClaimsDetails } from '../../hooks/useClaimsEscrow'

/* import utils */
import { truncateBalance } from '../../utils/formatting'
import { timeToDate } from '../../utils/time'
import { getGasConfig } from '../../utils/gas'

export const MyClaims: React.FC = () => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { claimsEscrow } = useContracts()
  const { account, errors, activeWalletConnector } = useWallet()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { makeTxToast } = useToasts()
  const claimsDetails = useGetClaimsDetails(account)
  const gasConfig = useMemo(() => getGasConfig(activeWalletConnector, activeNetwork, gasPrices.selected?.value), [
    activeWalletConnector,
    activeNetwork,
    gasPrices.selected?.value,
  ])

  /*************************************************************************************

    contract functions

  *************************************************************************************/

  const withdrawPayout = async (_claimId: any) => {
    if (!claimsEscrow || !_claimId) return
    const txType = FunctionName.WITHDRAW_CLAIMS_PAYOUT
    try {
      const tx = await claimsEscrow.withdrawClaimsPayout(_claimId, {
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: String(_claimId),
        status: TransactionCondition.PENDING,
        unit: Unit.ID,
      }
      addLocalTransactions(localTx)
      reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      reload()
    }
  }

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      {claimsDetails.length > 0 && (
        <Content>
          <Heading1>Your Claims</Heading1>
          <CardContainer cardsPerRow={2}>
            {claimsDetails.map((claim: ClaimDetails) => {
              return (
                <Card key={claim.id}>
                  <Box pt={20} pb={20} glow={claim.canWithdraw} green={claim.canWithdraw}>
                    <BoxItem>
                      <BoxItemTitle h3>ID</BoxItemTitle>
                      <Text h3>{claim.id}</Text>
                    </BoxItem>
                    <BoxItem>
                      <BoxItemTitle h3>Amount</BoxItemTitle>
                      <Text h3>
                        {parseFloat(formatUnits(claim.amount, currencyDecimals)) >= 1
                          ? truncateBalance(parseFloat(formatUnits(claim.amount, currencyDecimals)))
                          : formatUnits(claim.amount, currencyDecimals)}{' '}
                        {activeNetwork.nativeCurrency.symbol}
                      </Text>
                    </BoxItem>
                    <BoxItem>
                      <BoxItemTitle h3>Payout Status</BoxItemTitle>
                      <Text h3>
                        {claim.canWithdraw
                          ? 'Available'
                          : `${claim.cooldown == '0' ? '-' : timeToDate(parseInt(claim.cooldown) * 1000)} left`}
                      </Text>
                    </BoxItem>
                  </Box>
                  <ButtonWrapper mb={0} mt={20}>
                    <Button
                      widthP={100}
                      onClick={() => withdrawPayout(claim.id)}
                      disabled={!claim.canWithdraw || errors.length > 0}
                    >
                      Withdraw Payout
                    </Button>
                  </ButtonWrapper>
                </Card>
              )
            })}
          </CardContainer>
        </Content>
      )}
    </Fragment>
  )
}
