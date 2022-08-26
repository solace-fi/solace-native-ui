import { formatUnits } from 'ethers/lib/utils'
import React, { useMemo, useState } from 'react'
import { Accordion } from '../../../components/atoms/Accordion'
import { ButtonAppearance } from '../../../components/atoms/Button'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { CopyButton } from '../../../components/molecules/CopyButton'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { Modal } from '../../../components/molecules/Modal'
import { useGeneral } from '../../../context/GeneralManager'
import useCopyClipboard from '../../../hooks/internal/useCopyToClipboard'
import { floatUnits, shortenAddress, truncateValue } from '../../../utils/formatting'
import { useVoteContext } from '../VoteContext'

const TextOption = ({ mainText }: { mainText: string }) => {
  const { appTheme } = useGeneral()

  const gradientStyle = useMemo(
    () =>
      appTheme == 'light' ? { techygradient: true, warmgradient: false } : { techygradient: false, warmgradient: true },
    [appTheme]
  )
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <ButtonAppearance
      key={mainText}
      matchBg
      secondary
      noborder
      height={37}
      pt={10.5}
      pb={10.5}
      pl={12}
      pr={12}
      style={{ borderRadius: '8px' }}
      onClick={() => setCopied(mainText)}
    >
      <Flex stretch gap={12} justifyCenter>
        <Flex gap={8} itemsCenter>
          <Text {...gradientStyle} textAlignCenter>
            {isCopied ? 'Copied!' : shortenAddress(mainText)}
          </Text>
        </Flex>
      </Flex>
    </ButtonAppearance>
  )
}

const TextDropdownOptions = ({
  searchedList,
  isOpen,
  noneText,
}: {
  searchedList: { mainText: string }[]
  isOpen: boolean
  noneText?: string
}): JSX.Element => {
  return (
    <Accordion
      isOpen={isOpen}
      style={{ marginTop: isOpen ? 12 : 0, position: 'relative' }}
      customHeight={'380px'}
      noBackgroundColor
      thinScrollbar
      widthP={100}
    >
      <Flex col gap={8} p={12}>
        {searchedList.map((item) => (
          <TextOption key={item.mainText} mainText={item.mainText} />
        ))}
        {searchedList.length === 0 && (
          <Text t3 textAlignCenter bold>
            {noneText ?? 'No results found'}
          </Text>
        )}
      </Flex>
    </Accordion>
  )
}

export const DelegatorListModal = ({ show, handleClose }: { show: boolean; handleClose: () => void }): JSX.Element => {
  const { voteDelegators } = useVoteContext()
  const { delegatorVotesData } = voteDelegators

  const [searchTerm, setSearchTerm] = useState('')

  const activeList = useMemo(() => {
    const filtered = searchTerm
      ? delegatorVotesData.filter((item) => item.delegator.toLowerCase().includes(searchTerm.toLowerCase()))
      : delegatorVotesData
    return filtered
      .sort((a, b) => {
        const calcA =
          floatUnits(a.votePower, 18) -
          (parseFloat(a.usedVotePowerBPS.toString()) / 10000) * floatUnits(a.votePower, 18)
        const calcB =
          floatUnits(b.votePower, 18) -
          (parseFloat(b.usedVotePowerBPS.toString()) / 10000) * floatUnits(b.votePower, 18)
        return calcB - calcA
      })
      .map((item) => {
        return {
          mainText: item.delegator,
          // secondaryText: `${truncateValue(
          //   floatUnits(item.votePower, 18) -
          //     (parseFloat(item.usedVotePowerBPS.toString()) / 10000) * floatUnits(item.votePower, 18),
          //   2
          // )} free / ${truncateValue(formatUnits(item.votePower, 18), 2)}`,
        }
      })
  }, [searchTerm, delegatorVotesData])

  return (
    <Modal isOpen={show} handleClose={handleClose} modalTitle={'My delegators'}>
      <SmallerInputSection
        placeholder={'Search'}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          border: 'none',
        }}
      />
      <TextDropdownOptions
        isOpen={true}
        searchedList={activeList}
        // onClick={(value: string) => {
        //   onClick(value)
        //   handleClose()
        // }}
      />
    </Modal>
  )
}
