import { BigNumber } from 'ethers'
import React, { useCallback, useMemo } from 'react'
import { FunctionName } from '../../../constants/enums'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useUwLockVoting } from '../../../hooks/lock/useUwLockVoting'
import { useVoteContext } from '../VoteContext'
import { Button, GraySquareButton, ThinButton } from '../../../components/atoms/Button'
import { StyledArrowDropDown, StyledClose } from '../../../components/atoms/Icon'
import { Flex, ShadowDiv } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { processProtocolName } from '../../../components/organisms/Dropdown'
import { Card } from '../../../components/atoms/Card'
import { isAddress } from '../../../utils'
import { formatAmount } from '../../../utils/formatting'

export const DelegatorVoteGauge = ({ index }: { index: number }): JSX.Element => {
  const { gauges, voteGeneral, voteDelegator } = useVoteContext()
  const { isVotingOpen, onVoteInput, deleteVote } = voteGeneral
  const { handleGaugeSelectionModal } = gauges
  const { delegatorVotesData: votesData, delegator } = voteDelegator
  const appId = useMemo(() => votesData.localVoteAllocation[index].gauge, [votesData, index])
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { vote, removeVote } = useUwLockVoting()

  const callVote = useCallback(async () => {
    if (!delegator || !isAddress(delegator)) return
    if (!isVotingOpen) return
    if (!votesData.localVoteAllocation[index].changed) return
    if (
      !votesData.localVoteAllocation[index].gaugeActive &&
      !BigNumber.from(
        Math.floor(parseFloat(formatAmount(votesData.localVoteAllocation[index].votePowerPercentage)) * 100)
      ).isZero()
    )
      return
    await vote(
      delegator,
      votesData.localVoteAllocation[index].gaugeId,
      BigNumber.from(
        Math.floor(parseFloat(formatAmount(votesData.localVoteAllocation[index].votePowerPercentage)) * 100)
      )
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callVote', err, FunctionName.VOTE))
  }, [delegator, votesData.localVoteAllocation[index].votePowerPercentage, index, isVotingOpen])

  const callRemoveVote = useCallback(async () => {
    if (!delegator || !isAddress(delegator)) return
    if (!isVotingOpen) return
    await removeVote(delegator, votesData.localVoteAllocation[index].gaugeId)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callRemoveVote', err, FunctionName.REMOVE_VOTE))
  }, [delegator, votesData.localVoteAllocation, index, isVotingOpen])

  return (
    <Card matchBg p={10}>
      <Flex col gap={10}>
        <Flex gap={10}>
          <div style={{ width: '180px' }}>
            <ThinButton onClick={() => handleGaugeSelectionModal(index)}>
              <Flex style={{ width: '100%' }} itemsCenter>
                <Text autoAlignVertical p={5}>
                  {appId != '' && <img src={`https://assets.solace.fi/zapperLogos/${appId}`} height={16} />}
                </Text>
                <Text t5s style={{ width: '100%' }}>
                  <Flex between>
                    <Text t5s techygradient mont>
                      {appId != '' ? processProtocolName(appId) : 'Choose Gauge'}
                    </Text>
                    <StyledArrowDropDown size={16} />
                  </Flex>
                </Text>
              </Flex>
            </ThinButton>
          </div>
          <div style={{ width: '70px' }}>
            <SmallerInputSection
              placeholder={'%'}
              value={votesData.localVoteAllocation[index].votePowerPercentage}
              onChange={(e) => onVoteInput(e.target.value, index, false)}
            />
          </div>
          {votesData.localVoteAllocation[index].added ? (
            <ShadowDiv>
              <GraySquareButton width={36} actuallyWhite noborder onClick={() => deleteVote(index, false)}>
                X
              </GraySquareButton>
            </ShadowDiv>
          ) : (
            <div style={{ width: '36px' }}></div>
          )}
        </Flex>
        <Flex justifyCenter gap={10}>
          {!votesData.localVoteAllocation[index].added && (
            <Button error onClick={callRemoveVote} widthP={100}>
              Remove vote
            </Button>
          )}
          <Button
            secondary
            noborder
            techygradient
            onClick={callVote}
            widthP={100}
            disabled={!votesData.localVoteAllocation[index].gaugeActive}
          >
            Save Vote
          </Button>
        </Flex>
      </Flex>
    </Card>
  )
}
