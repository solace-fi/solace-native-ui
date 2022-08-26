import React, { useMemo, useState } from 'react'

import { Content, Flex } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { TileCard } from '../../components/molecules/TileCard'
import { GaugePieChart } from './GaugePieChart'
import { StatsBox } from './StatsBox'
import { OwnerVoteTab } from './OwnerVoteTab'
import { DelegatorVoteTab } from './DelegateVoteTab'
import VoteManager from './VoteContext'
import { useNetwork } from '../../context/NetworkManager'
import { StyledInfo } from '../../components/atoms/Icon'
import { Card } from '../../components/atoms/Card'

function Vote(): JSX.Element {
  const { activeNetwork } = useNetwork()
  const canVote = useMemo(() => activeNetwork.config.generalFeatures.native, [
    activeNetwork.config.generalFeatures.native,
  ])
  return (
    <>
      {canVote ? (
        <VoteManager>
          <VoteContent />
        </VoteManager>
      ) : (
        <Content>
          <Card error pt={10} pb={10} pl={15} pr={15}>
            <Flex>
              <TextSpan light textAlignLeft>
                <StyledInfo size={30} />
              </TextSpan>
              <Text light bold autoAlign>
                Voting is not available on this network.
              </Text>
            </Flex>
          </Card>
        </Content>
      )}
    </>
  )
}

export const VoteContent = () => {
  const [ownerTab, setOwnerTab] = useState(true)

  const { isMobile } = useWindowDimensions()

  return (
    <div style={{ margin: 'auto' }}>
      <Flex col={isMobile} row={!isMobile}>
        <Flex col widthP={!isMobile ? 60 : undefined} p={10} gap={20}>
          <GaugePieChart />
          <StatsBox />
        </Flex>
        <Flex col widthP={!isMobile ? 40 : undefined} p={10}>
          <TileCard gap={15} bgSecondary noPadding>
            <Flex
              stretch
              bgTertiary
              pt={1}
              style={{
                // rounded at the top only with 12px
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
              }}
            >
              <Flex
                justifyCenter
                py={8}
                bgSecondary={ownerTab}
                flex1
                onClick={() => setOwnerTab(true)}
                style={{
                  userSelect: 'none',
                  cursor: 'pointer',
                  borderTopLeftRadius: ownerTab ? 12 : 0,
                  borderTopRightRadius: ownerTab ? 12 : 0,
                }}
              >
                <Text semibold opposite={!ownerTab}>
                  Vote as myself
                </Text>
              </Flex>
              <Flex
                justifyCenter
                py={8}
                flex1
                bgSecondary={!ownerTab}
                onClick={() => setOwnerTab(false)}
                style={{
                  userSelect: 'none',
                  cursor: 'pointer',
                  // rounded only top right corner
                  borderTopRightRadius: !ownerTab ? 12 : 0,
                  borderTopLeftRadius: !ownerTab ? 12 : 0,
                }}
              >
                <Text semibold opposite={ownerTab}>
                  Vote as a delegate
                </Text>
              </Flex>
            </Flex>
            <Flex col px={24} pb={24} gap={15}>
              {ownerTab ? <OwnerVoteTab /> : <DelegatorVoteTab />}
            </Flex>
          </TileCard>
        </Flex>
      </Flex>
    </div>
  )
}

export default Vote
