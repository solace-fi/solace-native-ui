/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import config
    import components
    import constants
    import hooks
    import utils

    PositionStep function
      custom hooks
      useState hooks
      useRef variables
      Local functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { formProps } from './MultiStepForm'
import { CardContainer, PositionCard } from '../../components/atoms/Card'
import {
  PositionCardButton,
  PositionCardText,
  DeFiAssetImage,
  PositionCardName,
} from '../../components/atoms/DeFiAsset'
import { Loader } from '../../components/atoms/Loader'
import { Content, Scrollable, HeroContainer } from '../../components/atoms/Layout'
import { Heading1, TextSpan } from '../../components/atoms/Typography'
import { ManageModal } from '../../components/organisms/ManageModal'

/* import constants */
import { PolicyState } from '../../constants/enums'
import { LiquityPosition, Policy, Position, Token } from '../../constants/types'
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixedPositionBalance, truncateBalance } from '../../utils/formatting'
import { HyperLink } from '../../components/atoms/Link'
import { TokenPosition } from '../../components/organisms/TokenPosition'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, loading, positions } = formData

  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { errors } = useGeneral()
  const { account, library } = useWallet()
  const { activeNetwork, findNetworkByChainId, chainId } = useNetwork()
  const { setSelectedProtocolByName } = useContracts()
  const { userPolicyData, latestBlock, tokenPositionData } = useCachedData()
  const { width } = useWindowDimensions()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)
  const [selectablePositions, setSelectablePositions] = useState<Position[]>([])
  const [selectedPositions, setSelectedPositions] = useState<Position[]>(positions)
  const [fetchedPositions, setFetchedPositions] = useState<Position[]>([])
  const [productLink, setProductLink] = useState<string | undefined>(undefined)

  /*************************************************************************************

  useRef variables

  *************************************************************************************/
  const canLoadOverTime = useRef(false)

  /*************************************************************************************

  Local functions

  *************************************************************************************/

  const handleChange = () => {
    setForm({
      target: {
        name: 'positions',
        value: selectedPositions,
      },
    })
    navigation.next()
  }

  const handleSelect = (position: Position) => {
    const found = selectedPositions.some((selectedPosition) => {
      if (position.type == 'erc20') {
        return (
          (selectedPosition.position as Token).underlying.address == (position.position as Token).underlying.address
        )
      } else if (position.type == 'liquity') {
        return (
          (selectedPosition.position as LiquityPosition).positionAddress ==
          (position.position as LiquityPosition).positionAddress
        )
      }
    })
    if (!found) {
      setSelectedPositions((selectedPositions) => [position, ...selectedPositions])
    } else {
      setSelectedPositions(
        selectedPositions.filter((selectedPosition) => {
          if (position.type == 'erc20') {
            return (
              (selectedPosition.position as Token).underlying.address != (position.position as Token).underlying.address
            )
          } else if (position.type == 'liquity') {
            return (
              (selectedPosition.position as LiquityPosition).positionAddress !=
              (position.position as LiquityPosition).positionAddress
            )
          }
        })
      )
    }
  }

  const toggleSelectAll = () => {
    // deselect all
    if (selectedPositions.length == selectablePositions.length) {
      setSelectedPositions([])
    } else {
      // select all
      const positionsToAdd: Position[] = []
      selectablePositions.forEach((position: Position) => {
        const found = selectedPositions.find((selectedPosition) => {
          if (position.type == 'erc20') {
            return (
              (selectedPosition.position as Token).underlying.address == (position.position as Token).underlying.address
            )
          } else if (position.type == 'liquity') {
            return (
              (selectedPosition.position as LiquityPosition).positionAddress ==
              (position.position as LiquityPosition).positionAddress
            )
          }
        })
        if (!found) {
          positionsToAdd.push(position)
        }
      })
      setSelectedPositions((selectedPositions) => [...positionsToAdd, ...selectedPositions])
    }
  }

  const getUserPositions = async () => {
    if (!account || !library || !tokenPositionData.dataInitialized || !chainId) return
    if (findNetworkByChainId(chainId)) {
      try {
        const supportedProduct = activeNetwork.cache.supportedProducts.find((product) => product.name == protocol.name)
        if (!supportedProduct) return
        const cache = tokenPositionData.storedTokenAndPositionData.find((dataset) => dataset.name == activeNetwork.name)
        if (supportedProduct.positionsType == 'erc20' && cache && typeof supportedProduct.getBalances !== 'undefined') {
          const savedTokens = cache.tokens[supportedProduct.name].savedTokens
          const balances: Token[] = await supportedProduct.getBalances(
            account,
            library,
            cache,
            activeNetwork,
            savedTokens
          )
          setFetchedPositions(
            balances.map((balance) => {
              return { type: 'erc20', position: balance }
            })
          )
        } else if (
          supportedProduct.positionsType == 'liquity' &&
          typeof supportedProduct.getPositions !== 'undefined'
        ) {
          const positions: LiquityPosition[] = await supportedProduct.getPositions(account, library, activeNetwork)
          setFetchedPositions(
            positions.map((balance) => {
              return { type: 'liquity', position: balance }
            })
          )
        }
        setForm({
          target: {
            name: 'loading',
            value: false,
          },
        })
      } catch (err) {
        console.log(err)
      }
    }
  }

  const userHasActiveProductPosition = (product: string, position: string): boolean => {
    for (const policy of userPolicyData.userPolicies) {
      if (
        product === policy.productName &&
        policy.positionNames.includes(position) &&
        policy.status === PolicyState.ACTIVE
      )
        return true
    }
    return false
  }

  const openManageModal = async (policy: Policy) => {
    setShowManageModal((prev) => !prev)
    setSelectedProtocolByName(policy.productName)
    document.body.style.overflowY = 'hidden'
    setSelectedPolicy(policy)
  }

  const closeModal = useCallback(() => {
    setShowManageModal(false)
    document.body.style.overflowY = 'scroll'
  }, [])

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const getProductLink = () => {
      const supportedProduct = activeNetwork.cache.supportedProducts.find((product) => product.name == protocol.name)
      if (!supportedProduct) return
      if (supportedProduct.productLink) setProductLink(supportedProduct.productLink)
    }
    getProductLink()
  }, [])

  useEffect(() => {
    const loadOnBoot = async () => {
      setForm({
        target: {
          name: 'loading',
          value: true,
        },
      })
      await getUserPositions()
      canLoadOverTime.current = true
    }
    loadOnBoot()
  }, [])

  useEffect(() => {
    const loadOverTime = async () => {
      if (canLoadOverTime.current) {
        await getUserPositions()
      }
    }
    loadOverTime()
  }, [latestBlock, tokenPositionData.dataInitialized])

  useEffect(() => {
    setSelectablePositions(
      fetchedPositions.filter((position: Position) => {
        let positionStr = ''
        if (position.type == 'erc20') {
          positionStr = (position.position as Token).underlying.symbol
        } else if (position.type == 'liquity') {
          positionStr = (position.position as LiquityPosition).positionName
        }
        return !userHasActiveProductPosition(protocol.name, positionStr)
      })
    )
  }, [fetchedPositions, protocol.name])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Fragment>
      <ManageModal
        selectedPolicy={selectedPolicy}
        isOpen={showManageModal}
        latestBlock={latestBlock}
        closeModal={closeModal}
      />
      {fetchedPositions.length == 0 && !loading && !userPolicyData.policiesLoading && (
        <HeroContainer>
          <Heading1 textAlignCenter>You do not own any positions on this protocol.</Heading1>
          {productLink && (
            <HyperLink href={productLink} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
              <Button secondary>Click here to start positions on {protocol.name}</Button>
            </HyperLink>
          )}
        </HeroContainer>
      )}
      {!loading && !userPolicyData.policiesLoading ? (
        <Content>
          {selectablePositions.length > 0 && (
            <ButtonWrapper style={{ marginTop: '0' }} isColumn={width <= MAX_MOBILE_SCREEN_WIDTH}>
              <Button widthP={100} secondary onClick={() => toggleSelectAll()}>
                {selectedPositions.length == selectablePositions.length
                  ? `Deselect All (${selectablePositions.length} available)`
                  : `Select All (${selectablePositions.length} available)`}
              </Button>
              <Button disabled={selectedPositions.length == 0} widthP={100} onClick={handleChange}>
                Proceed to next page
              </Button>
            </ButtonWrapper>
          )}
          {fetchedPositions.length > 0 && (
            <Scrollable maxMobileHeight={65}>
              <CardContainer>
                {fetchedPositions.map((position: Position) => {
                  if (position.type == 'erc20') {
                    return (
                      <TokenPosition
                        key={(position.position as Token).underlying.address}
                        position={position}
                        protocolName={protocol.name}
                        selectedPositions={selectedPositions}
                        userPolicies={userPolicyData.userPolicies}
                        openManageModal={openManageModal}
                        handleSelect={handleSelect}
                        userHasActiveProductPosition={userHasActiveProductPosition}
                      />
                    )
                  } else if (position.type == 'liquity') {
                    return (
                      <PositionCard
                        key={(position.position as LiquityPosition).positionAddress}
                        blue={selectedPositions.some(
                          (selectedPosition) =>
                            (selectedPosition.position as LiquityPosition).positionAddress ==
                            (position.position as LiquityPosition).positionAddress
                        )}
                        glow={selectedPositions.some(
                          (selectedPosition) =>
                            (selectedPosition.position as LiquityPosition).positionAddress ==
                            (position.position as LiquityPosition).positionAddress
                        )}
                        fade={userHasActiveProductPosition(
                          protocol.name,
                          (position.position as LiquityPosition).positionName
                        )}
                        onClick={
                          errors.length > 0
                            ? undefined
                            : userHasActiveProductPosition(
                                protocol.name,
                                (position.position as LiquityPosition).positionName
                              )
                            ? () =>
                                openManageModal(
                                  userPolicyData.userPolicies.filter(
                                    (policy) =>
                                      policy.productName == protocol.name &&
                                      policy.positionNames.includes((position.position as LiquityPosition).positionName)
                                  )[0]
                                )
                            : () => handleSelect(position)
                        }
                      >
                        {userHasActiveProductPosition(
                          protocol.name,
                          (position.position as LiquityPosition).positionName
                        ) && (
                          <PositionCardText style={{ opacity: '.8' }}>
                            This position is already covered
                          </PositionCardText>
                        )}
                        <DeFiAssetImage
                          borderless
                          style={{
                            opacity: userHasActiveProductPosition(
                              protocol.name,
                              (position.position as LiquityPosition).positionName
                            )
                              ? '.5'
                              : '1',
                          }}
                        >
                          <img
                            src={`https://assets.solace.fi/${(position.position as LiquityPosition).positionAddress.toLowerCase()}`}
                            alt={(position.position as LiquityPosition).positionName}
                          />
                        </DeFiAssetImage>
                        <PositionCardName
                          high_em
                          style={{
                            opacity: userHasActiveProductPosition(
                              protocol.name,
                              (position.position as LiquityPosition).positionName
                            )
                              ? '.5'
                              : '1',
                          }}
                        >
                          {(position.position as LiquityPosition).positionName}
                        </PositionCardName>
                        <PositionCardText
                          t1
                          high_em
                          style={{
                            opacity: userHasActiveProductPosition(
                              protocol.name,
                              (position.position as LiquityPosition).positionName
                            )
                              ? '.5'
                              : '1',
                          }}
                        >
                          {truncateBalance(
                            fixedPositionBalance((position.position as LiquityPosition).amount.toString(), 18)
                          )}{' '}
                          <TextSpan style={{ fontSize: '12px' }}>
                            {(position.position as LiquityPosition).associatedToken.symbol}
                          </TextSpan>
                        </PositionCardText>
                        <PositionCardButton>
                          {userHasActiveProductPosition(
                            protocol.name,
                            (position.position as LiquityPosition).positionName
                          ) ? (
                            <Button widthP={width > MAX_MOBILE_SCREEN_WIDTH ? undefined : 100}>Manage</Button>
                          ) : (
                            <Button widthP={width > MAX_MOBILE_SCREEN_WIDTH ? undefined : 100}>
                              {selectedPositions.some(
                                (selectedPosition) =>
                                  (selectedPosition.position as LiquityPosition).positionAddress ==
                                  (position.position as LiquityPosition).positionAddress
                              )
                                ? 'Deselect'
                                : 'Select'}
                            </Button>
                          )}
                        </PositionCardButton>
                      </PositionCard>
                    )
                  }
                })}
              </CardContainer>
            </Scrollable>
          )}
        </Content>
      ) : (
        <Loader />
      )}
    </Fragment>
  )
}
