import { BigNumber, ZERO, ZERO_ADDRESS } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GaugeSelectionModal } from '../../components/organisms/GaugeSelectionModal'
import { DelegatorVotesData, GaugeData, VoteAllocation, VotesData } from '../../constants/types'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useGaugeControllerHelper } from '../../hooks/gauge/useGaugeController'
import { useUwLockVoting, useUwLockVotingHelper } from '../../hooks/lock/useUwLockVoting'
import { filterAmount, fixed, floatUnits, formatAmount } from '../../utils/formatting'
import { useContracts } from '../../context/ContractsManager'
import { DelegateModal } from './organisms/DelegateModal'

type VoteContextType = {
  intrface: {
    gaugesLoading: boolean
  }
  gauges: {
    gaugesData: GaugeData[]
    insuranceCapacity: number
    handleGaugeSelectionModal: (index: number, isOwner?: boolean) => void
  }
  delegateData: {
    delegate: string
    delegateModalOpen: boolean
    handleDelegateModalOpen: (value: boolean) => void
  }
  voteGeneral: {
    isVotingOpen: boolean
    onVoteInput: (input: string, index: number, isOwner: boolean) => void
    deleteVote: (index: number, isOwner: boolean) => void
    addEmptyVote: (isOwner: boolean) => void
    assign: (gaugeName: string, gaugeId: BigNumber, index: number, isOwner: boolean) => void
  }
  voteOwner: {
    votesData: VotesData
    editingVotesData: VotesData
    handleEditingVotesData: (votesData: VotesData) => void
  }
  voteDelegators: {
    delegateVotesData: VotesData
    editingDelegateVotesData: VotesData
    delegatorVotesData: DelegatorVotesData[]
    handleDelegateVotesData: (data: VotesData) => void
    handleEditingDelegateVotesData: (data: VotesData) => void
  }
}

const VoteContext = createContext<VoteContextType>({
  intrface: {
    gaugesLoading: false,
  },
  gauges: {
    gaugesData: [],
    insuranceCapacity: 0,
    handleGaugeSelectionModal: () => undefined,
  },
  delegateData: {
    delegate: ZERO_ADDRESS,
    delegateModalOpen: false,
    handleDelegateModalOpen: () => undefined,
  },
  voteGeneral: {
    isVotingOpen: false,
    onVoteInput: () => undefined,
    deleteVote: () => undefined,
    addEmptyVote: () => undefined,
    assign: () => undefined,
  },
  voteOwner: {
    votesData: {
      localVoteAllocation: [],
      votePower: ZERO,
      usedVotePowerBPS: ZERO,
      localVoteAllocationPercentageTotal: 0,
    },
    editingVotesData: {
      localVoteAllocation: [],
      votePower: ZERO,
      usedVotePowerBPS: ZERO,
      localVoteAllocationPercentageTotal: 0,
    },
    handleEditingVotesData: () => undefined,
  },
  voteDelegators: {
    delegateVotesData: {
      localVoteAllocation: [],
      votePower: ZERO,
      usedVotePowerBPS: ZERO,
      localVoteAllocationPercentageTotal: 0,
    },
    editingDelegateVotesData: {
      localVoteAllocation: [],
      votePower: ZERO,
      usedVotePowerBPS: ZERO,
      localVoteAllocationPercentageTotal: 0,
    },
    delegatorVotesData: [],
    handleEditingDelegateVotesData: () => undefined,
    handleDelegateVotesData: () => undefined,
  },
})

const VoteManager: React.FC = (props) => {
  const { loading: gaugesLoading, gaugesData, insuranceCapacity } = useGaugeControllerHelper()
  const { keyContracts } = useContracts()
  const { uwLockVoting } = keyContracts

  const { isVotingOpen: checkIfVotingIsOpen, delegateOf, getVotingDelegatorsOf: getDelegators } = useUwLockVoting()
  const { getVoteInformation } = useUwLockVotingHelper()
  const { positiveVersion } = useCachedData()
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { latestBlock } = useProvider()
  const [isVotingOpen, setIsVotingOpen] = useState(true)
  const [openGaugeSelectionModal, setOpenGaugeSelectionModal] = useState(false)
  const [editingGaugeSelection, setEditingGaugeSelection] = useState<{ index?: number; isOwner?: boolean }>({
    index: undefined,
    isOwner: undefined,
  })
  const [votesData, setVotesData] = useState<VotesData>({
    votePower: ZERO,
    usedVotePowerBPS: ZERO,
    localVoteAllocation: [],
    localVoteAllocationPercentageTotal: 0,
  })
  const [editingVotesData, setEditingVotesData] = useState<VotesData>(votesData)
  const [editingDelegateVotesData, setEditingDelegateVotesData] = useState<VotesData>(votesData)
  const [delegatorVotesData, setDelegatorVotesData] = useState<DelegatorVotesData[]>([])
  const [delegateVotesData, setDelegateVotesData] = useState<VotesData>(votesData)
  const [currentDelegate, setCurrentDelegate] = useState(ZERO_ADDRESS)
  const [delegateModalOpen, setDelegateModalOpen] = useState(false)

  const handleDelegateVotesData = useCallback((data: VotesData) => {
    setDelegateVotesData(data)
  }, [])

  const handleEditingDelegateVotesData = useCallback((data: VotesData) => {
    setEditingDelegateVotesData(data)
  }, [])

  const handleEditingVotesData = useCallback((data: VotesData) => {
    setEditingVotesData(data)
  }, [])

  const handleDelegateModalOpen = useCallback((value: boolean) => {
    setDelegateModalOpen(value)
  }, [])

  const onVoteInput = useCallback((input: string, index: number, isOwner: boolean) => {
    if (isOwner) {
      setEditingVotesData((prevState) => {
        const newAlloc = prevState.localVoteAllocation.map((data, i) => {
          if (i == index) {
            const filtered = filterAmount(input, data.votePowerPercentage)
            const formatted: string = formatAmount(filtered)
            if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) return data
            if (parseFloat(formatted) > 100) return data
            return {
              ...data,
              votePowerPercentage: filtered,
              changed: true,
            }
          }
          return data
        })
        return {
          ...prevState,
          localVoteAllocation: newAlloc,
          localVoteAllocationPercentageTotal: newAlloc.reduce(
            (acc, curr) => acc + parseFloat(curr.votePowerPercentage),
            0
          ),
        }
      })
    } else {
      setEditingDelegateVotesData((prevState) => {
        const newAlloc = prevState.localVoteAllocation.map((data, i) => {
          if (i == index) {
            const filtered = filterAmount(input, data.votePowerPercentage)
            const formatted: string = formatAmount(filtered)
            if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) return data
            if (parseFloat(formatted) > 100) return data
            return {
              ...data,
              votePowerPercentage: filtered,
              changed: true,
            }
          }
          return data
        })
        return {
          ...prevState,
          localVoteAllocation: newAlloc,
          localVoteAllocationPercentageTotal: newAlloc.reduce(
            (acc, curr) => acc + parseFloat(curr.votePowerPercentage),
            0
          ),
        }
      })
    }
  }, [])

  const deleteVote = useCallback((index: number, isOwner: boolean) => {
    if (isOwner) {
      setEditingVotesData((prevState) => {
        const filtered = prevState.localVoteAllocation.filter((voteData, i) => i !== index)
        return {
          ...prevState,
          localVoteAllocation: filtered,
          localVoteAllocationPercentageTotal: filtered.reduce((acc, curr) => {
            return acc + parseFloat(curr.votePowerPercentage)
          }, 0),
        }
      })
    } else {
      setEditingDelegateVotesData((prevState) => {
        const filtered = prevState.localVoteAllocation.filter((voteData, i) => i !== index)
        return {
          ...prevState,
          localVoteAllocation: filtered,
          localVoteAllocationPercentageTotal: filtered.reduce((acc, curr) => {
            return acc + parseFloat(curr.votePowerPercentage)
          }, 0),
        }
      })
    }
  }, [])

  const addEmptyVote = useCallback((isOwner: boolean) => {
    if (isOwner) {
      setEditingVotesData((prevState) => {
        return {
          ...prevState,
          localVoteAllocation: [
            ...prevState.localVoteAllocation,
            { gauge: '', gaugeId: ZERO, votePowerPercentage: '', added: true, changed: false, gaugeActive: false },
          ],
        }
      })
    } else {
      setEditingDelegateVotesData((prevState) => {
        return {
          ...prevState,
          localVoteAllocation: [
            ...prevState.localVoteAllocation,
            { gauge: '', gaugeId: ZERO, votePowerPercentage: '', added: true, changed: false, gaugeActive: false },
          ],
        }
      })
    }
  }, [])

  const assign = useCallback(
    (gaugeName: string, gaugeId: BigNumber, index: number, isOwner: boolean) => {
      if (isOwner) {
        setEditingVotesData((prevState) => {
          return {
            ...prevState,
            localVoteAllocation: prevState.localVoteAllocation.map((vote, i) => {
              if (i == index) {
                if (vote.gauge === gaugeName && vote.gaugeId.eq(gaugeId)) return vote
                return {
                  ...vote,
                  gauge: gaugeName,
                  gaugeId: gaugeId,
                  changed: true,
                  gaugeActive: gaugesData.find((item) => item.gaugeId.eq(gaugeId))?.isActive ?? false,
                }
              }
              return vote
            }),
          }
        })
      } else {
        setEditingDelegateVotesData((prevState) => {
          return {
            ...prevState,
            localVoteAllocation: prevState.localVoteAllocation.map((vote, i) => {
              if (i == index) {
                if (vote.gauge === gaugeName && vote.gaugeId.eq(gaugeId)) return vote
                return {
                  ...vote,
                  gauge: gaugeName,
                  gaugeId: gaugeId,
                  changed: true,
                  gaugeActive: gaugesData.find((item) => item.gaugeId.eq(gaugeId))?.isActive ?? false,
                }
              }
              return vote
            }),
          }
        })
      }
    },
    [gaugesData]
  )

  const handleGaugeSelectionModal = useCallback((index?: number, isOwner?: boolean) => {
    setEditingGaugeSelection({
      index,
      isOwner,
    })
    setOpenGaugeSelectionModal(index !== undefined)
  }, [])

  // mounting fetch (account switch or activenetwork switch) and version
  useEffect(() => {
    const getUserVotesData = async () => {
      if (!account || gaugesData.length == 0 || !uwLockVoting) {
        const res = {
          votePower: ZERO,
          usedVotePowerBPS: ZERO,
          localVoteAllocation: [],
          localVoteAllocationPercentageTotal: 0,
        }
        setVotesData(res)
        setEditingVotesData(res)
        setDelegateVotesData(res)
        setEditingDelegateVotesData(res)
        return
      }

      // fetch this current user's vote information and organize state
      const userVoteInfo = await getVoteInformation(account)
      const _delegators = await getDelegators(account)

      const delegatorsVotesData = await Promise.all(_delegators.map(async (delegator) => getVoteInformation(delegator)))
      const normalizedDelegatorsVoteAllocations_amount: number[][] = []

      const formattedDelegatorVotesData: VoteAllocation[][] = []

      const totalVotePower = delegatorsVotesData.reduce((acc, curr) => {
        return acc.add(curr.votePower)
      }, ZERO)

      // fill in the blank gauge votes of each delegator and return the equivalent allocation of votes
      for (let i = 0; i < delegatorsVotesData.length; i++) {
        const formattedDelegatorVotesDataItem = delegatorsVotesData[i].votes.map((item) => {
          const foundGauge = gaugesData.find((g) => g.gaugeId.eq(item.gaugeID))
          const name = foundGauge?.gaugeName ?? ''
          const active = foundGauge?.isActive ?? false
          return {
            gauge: name,
            votePowerPercentage: (parseFloat(item.votePowerBPS.toString()) / 100).toString(), // e.g. 9988 => '99.88'
            gaugeId: item.gaugeID,
            added: false,
            changed: false,
            gaugeActive: active,
          }
        })
        formattedDelegatorVotesData.push(formattedDelegatorVotesDataItem)

        for (let j = 0; j < gaugesData.length; j++) {
          const foundGauge = delegatorsVotesData[i].votes.find((item) => item.gaugeID.eq(gaugesData[j].gaugeId))
          normalizedDelegatorsVoteAllocations_amount.push([])
          if (foundGauge) {
            const float_votePowerPercentage = parseFloat(foundGauge.votePowerBPS.toString()) / 100
            const str_votePowerPercentage = float_votePowerPercentage.toString() // e.g. 9988 => '99.88'
            normalizedDelegatorsVoteAllocations_amount[i].push(
              (floatUnits(delegatorsVotesData[i].votePower, 18) * parseFloat(str_votePowerPercentage)) / 100 // e.g. 100 VP * 99.88 / 100 = 99.88 VP
            )
          } else {
            normalizedDelegatorsVoteAllocations_amount[i].push(0)
          }
        }
      }

      const newDelegatorsVoteData = delegatorsVotesData.map((item, i) => {
        const res: DelegatorVotesData = {
          votePower: item.votePower,
          usedVotePowerBPS: item.usedVotePowerBPS,
          localVoteAllocation: formattedDelegatorVotesData[i],
          localVoteAllocationPercentageTotal: formattedDelegatorVotesData[i].reduce((acc, curr) => {
            return acc + parseFloat(curr.votePowerPercentage)
          }, 0),
          delegator: _delegators[i],
        }
        return res
      })
      setDelegatorVotesData(newDelegatorsVoteData)

      // sum up the allocation of each gauge based on the allocations of each delegator, then convert to percentages, delete gauges with 0 allocs
      const redistributedGaugeAllocationPercentages = []
      for (let i = 0; i < gaugesData.length; i++) {
        let gaugeAllocationTotal = 0
        for (let j = 0; j < delegatorsVotesData.length; j++) {
          gaugeAllocationTotal += normalizedDelegatorsVoteAllocations_amount[j][i]
        }
        if (gaugeAllocationTotal > 0) {
          redistributedGaugeAllocationPercentages.push({
            percentage: gaugeAllocationTotal / floatUnits(totalVotePower, 18),
            gaugeName: gaugesData[i].gaugeName,
            gaugeId: gaugesData[i].gaugeId,
            isActive: gaugesData[i].isActive,
          })
        }
      }

      const redistributedGaugeAllocationPercentageTotal = redistributedGaugeAllocationPercentages.reduce(
        (acc, curr) => {
          return acc + curr.percentage
        },
        0
      )

      // assign new gauge allocation percentages based on the redistributed percentages
      const redistributedSingularDelegatorVotePercentages: VoteAllocation[] = []
      for (let i = 0; i < redistributedGaugeAllocationPercentages.length; i++) {
        redistributedSingularDelegatorVotePercentages.push({
          gauge: redistributedGaugeAllocationPercentages[i].gaugeName,
          votePowerPercentage: fixed(redistributedGaugeAllocationPercentages[i].percentage * 100, 2).toString(),
          gaugeId: redistributedGaugeAllocationPercentages[i].gaugeId,
          added: false,
          changed: false,
          gaugeActive: redistributedGaugeAllocationPercentages[i].isActive,
        })
      }

      const newDelegateVoteData: VotesData = {
        votePower: totalVotePower,
        usedVotePowerBPS: BigNumber.from(fixed(redistributedGaugeAllocationPercentageTotal * 10000, 0).toString()),
        localVoteAllocation: redistributedSingularDelegatorVotePercentages,
        localVoteAllocationPercentageTotal: redistributedSingularDelegatorVotePercentages.reduce((acc, curr) => {
          return acc + parseFloat(curr.votePowerPercentage)
        }, 0),
      }

      handleDelegateVotesData(newDelegateVoteData)
      setEditingDelegateVotesData(newDelegateVoteData)

      const formattedUserVotesData = userVoteInfo.votes.map((item) => {
        const foundGauge = gaugesData.find((g) => g.gaugeId.eq(item.gaugeID))
        const name = foundGauge?.gaugeName ?? ''
        const isActive = foundGauge?.isActive ?? false
        const alloc: VoteAllocation = {
          gauge: name,
          votePowerPercentage: (parseFloat(item.votePowerBPS.toString()) / 100).toString(), // e.g. 9988 => '99.88'
          gaugeId: item.gaugeID,
          added: false,
          changed: false,
          gaugeActive: isActive,
        }
        return alloc
      })

      // add allocation into votesData and calculate allocation total
      const newVotesData = {
        votePower: userVoteInfo.votePower,
        usedVotePowerBPS: userVoteInfo.usedVotePowerBPS,
        localVoteAllocation: formattedUserVotesData,
        localVoteAllocationPercentageTotal: formattedUserVotesData.reduce((acc, curr) => {
          return acc + parseFloat(curr.votePowerPercentage)
        }, 0),
      }

      setVotesData(newVotesData)
      setEditingVotesData(newVotesData)
    }
    getUserVotesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, gaugesData.length, activeNetwork, positiveVersion])

  // latestBlock fetch
  useEffect(() => {
    const updateActivenessOnEdit = async () => {
      const s = editingVotesData.localVoteAllocation.map((item) => {
        const foundGauge = gaugesData.find((g) => g.gaugeId.eq(item.gaugeId))
        const isActive = foundGauge?.isActive ?? false
        return {
          ...item,
          gaugeActive: isActive,
        }
      })

      const newVotesData = {
        ...votesData,
        localVoteAllocation: s,
      }
      setEditingVotesData(newVotesData)
    }
    if (gaugesData.length == 0) return
    updateActivenessOnEdit()
  }, [latestBlock])

  useEffect(() => {
    const callVotingOpen = async () => {
      const res = await checkIfVotingIsOpen()
      setIsVotingOpen(res)
    }
    callVotingOpen()
  }, [activeNetwork, latestBlock])

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
  }, [delegateOf, account, positiveVersion])

  const value = useMemo<VoteContextType>(
    () => ({
      intrface: {
        gaugesLoading,
      },
      gauges: {
        insuranceCapacity,
        gaugesData,
        handleGaugeSelectionModal,
      },
      delegateData: {
        delegate: currentDelegate,
        delegateModalOpen,
        handleDelegateModalOpen,
      },
      voteGeneral: {
        isVotingOpen,
        assign,
        addEmptyVote,
        onVoteInput,
        deleteVote,
      },
      voteOwner: {
        votesData,
        editingVotesData,
        handleEditingVotesData,
      },
      voteDelegators: {
        delegateVotesData,
        delegatorVotesData,
        editingDelegateVotesData,
        handleEditingDelegateVotesData,
        handleDelegateVotesData,
      },
      delegatorVotesData,
    }),
    [
      gaugesData,
      gaugesLoading,
      isVotingOpen,
      assign,
      addEmptyVote,
      onVoteInput,
      deleteVote,
      votesData,
      delegateVotesData,
      handleGaugeSelectionModal,
      handleDelegateVotesData,
      editingDelegateVotesData,
      handleEditingDelegateVotesData,
      editingVotesData,
      currentDelegate,
      delegateModalOpen,
      handleDelegateModalOpen,
      insuranceCapacity,
      handleEditingVotesData,
      delegatorVotesData,
    ]
  )

  return (
    <VoteContext.Provider value={value}>
      <GaugeSelectionModal
        show={openGaugeSelectionModal}
        target={editingGaugeSelection}
        gaugesData={gaugesData}
        votesAllocationData={
          editingGaugeSelection.isOwner ? editingVotesData.localVoteAllocation : delegateVotesData.localVoteAllocation
        }
        handleCloseModal={() => handleGaugeSelectionModal(undefined, undefined)}
        assign={assign}
      />
      <DelegateModal show={delegateModalOpen} handleCloseModal={() => handleDelegateModalOpen(false)} />
      {props.children}
    </VoteContext.Provider>
  )
}

export function useVoteContext(): VoteContextType {
  return useContext(VoteContext)
}

export default VoteManager
