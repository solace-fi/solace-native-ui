import useDebounce from '@rooks/use-debounce'
import { capitalizeFirstLetter, ProtocolMap } from '@solace-fi/sdk-nightly'
import React, { useEffect, useMemo, useState } from 'react'
import { ThinButton, GraySquareButton } from '../../components/atoms/Button'
import { StyledArrowDropDown, StyledClose } from '../../components/atoms/Icon'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import { LocalSolaceRiskProtocol } from '../../constants/types'
import usePrevious from '../../hooks/internal/usePrevious'
import { getZapperProtocolBalances } from '../../utils/api'
import { filterAmount } from '../../utils/formatting'
import { useCoverageContext } from './CoverageContext'
import { DropdownOptionsUnique, processProtocolName } from './Dropdown'
import { formatAmount } from '../../utils/formatting'
import { Button } from '../../components/atoms/Button'
import mapEditableProtocols from '../../utils/mapEditableProtocols'

export default function AddProtocolForm({
  editableProtocols,
  onAddProtocol,
  setIsAddingProtocol,
}: {
  editableProtocols: LocalSolaceRiskProtocol[]
  onAddProtocol: (appId: string, balance: string) => void
  setIsAddingProtocol: (bool: boolean) => void
}): React.ReactElement {
  // const [protocol, setProtocol] = useState<LocalSolaceRiskProtocol | undefined>(undefined)
  const { seriesKit, styles } = useCoverageContext()
  const { series, seriesLogos } = seriesKit
  const { gradientStyle } = styles

  const [protocolsOpen, setProtocolsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const [enteredBalance, setEnteredBalance] = useState<string>('')
  const [enteredProtocolMap, setEnteredProtocolMap] = useState<ProtocolMap | undefined>(undefined)

  const isValidProtocol = useMemo(() => {
    if (!series) return false
    return series.data.protocolMap.find((p) => p.appId.toLowerCase() == enteredProtocolMap?.appId.toLowerCase())
  }, [enteredProtocolMap, series])

  const protocolOptions = useMemo(() => seriesLogos, [seriesLogos])

  const activeList = useMemo(
    () => (searchTerm ? protocolOptions.filter((item) => item.label.includes(searchTerm)) : protocolOptions),
    [searchTerm, protocolOptions]
  )

  // const processListItem = (listItem: { label: string; value: string; icon: JSX.Element }) => ({
  //   label: listItem.label,
  //   value: listItem.value,
  //   icon: listItem.icon,
  //   name: processProtocolName(listItem.value),
  // })
  // const _mapEditableProtocols = useMemo(() => {
  //   return mapEditableProtocols(editableProtocols)
  // }, [editableProtocols])

  const cachedDropdownOptions = useMemo(
    () => (
      <DropdownOptionsUnique
        comparingList={editableProtocols.map((p) => p.appId)}
        isOpen={dropdownOpen}
        searchedList={activeList}
        noneText={'No matching protocols found'}
        onClick={(value: string) => {
          if (!series) return
          const foundProtocol = series.data.protocolMap.find((p) => p.appId.toLowerCase() == value.toLowerCase())
          if (!foundProtocol) return
          setEnteredProtocolMap(foundProtocol)
          setDropdownOpen(false)
        }}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editableProtocols, dropdownOpen, activeList]
  )

  // const _editAmount = useDebounce(() => {
  //   editAmount(protocol.appId, enteredAmount)
  // }, 300)

  // useEffect(() => {
  //   if (!simulatingPrev && simulating) close()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [simulatingPrev, simulating])

  // useEffect(() => {
  //   _editAmount()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [enteredAmount])

  // useEffect(() => {
  //   protocol && setEnteredBalance(protocol.balanceUSD.toString() == '0' ? '' : protocol.balanceUSD.toString())
  // }, [protocol, protocol?.balanceUSD])

  useEffect(() => {
    if (!protocolsOpen) {
      setTimeout(() => {
        setDropdownOpen(false)
      }, 100)
    } else {
      setDropdownOpen(true)
    }
  }, [protocolsOpen])

  // useEffect(() => {
  //   if (!editingItem || (editingItem && editingItem.toString() !== protocol.appId.toString())) {
  //     // setProtocolsOpen(false)
  //     setDropdownOpen(false)
  //   }
  // }, [editingItem, protocol.appId])

  return (
    <>
      <div
        style={{
          width: '100%',
        }}
      >
        <ThinButton
          onClick={() => {
            setDropdownOpen(!dropdownOpen)
          }}
        >
          <Flex itemsCenter={!!isValidProtocol} style={!isValidProtocol ? { width: '100%' } : {}}>
            <Text autoAlignVertical p={5}>
              {enteredProtocolMap && isValidProtocol ? (
                <img src={`https://assets.solace.fi/zapperLogos/${enteredProtocolMap.appId}`} height={16} />
              ) : (
                // <StyledHelpCircle size={16} />
                <></>
              )}
            </Text>
            <Text t5s style={!isValidProtocol ? { width: '100%' } : {}}>
              {/* {capitalizeFirstLetter(enteredProtocolMap.appId.includes('Empty') ? 'Choose Protocol' : enteredProtocolMap.appId)} */}
              {enteredProtocolMap && isValidProtocol ? (
                processProtocolName(enteredProtocolMap.appId)
              ) : (
                <Flex between>
                  <Text t5s>
                    {enteredProtocolMap &&
                      capitalizeFirstLetter(
                        enteredProtocolMap.appId.includes('Empty') ? 'Choose Protocol' : enteredProtocolMap.appId
                      )}
                  </Text>
                  <StyledArrowDropDown size={16} />
                </Flex>
              )}
            </Text>
          </Flex>
        </ThinButton>
      </div>
      <SmallerInputSection
        placeholder={'Held amount'}
        value={enteredBalance}
        // onChange={(e) => setEnteredAmount(filterAmount(e.target.value, enteredAmount))}
        onChange={(e) => {
          // validate amount
          const numberAmount = parseInt(e.target.value)
          // if under 0, it's 0
          if (numberAmount < 0) setEnteredBalance('0')
          // if not valid, return
          if (isNaN(numberAmount)) return
          // otherwise, it's valid, so just set it
          setEnteredBalance(e.target.value)
        }}
        style={{
          maxWidth: '106px',
          width: '106px',
          minWidth: '106px',
          maxHeight: '32px',
        }}
        asideBg
      />
      {cachedDropdownOptions}
      <GraySquareButton
        width={32}
        height={32}
        noborder
        onClick={() => {
          setIsAddingProtocol(false)
        }}
        darkText
      >
        <StyledClose size={16} />
      </GraySquareButton>
      <Button
        onClick={() => {
          onAddProtocol(enteredProtocolMap?.appId ?? '', formatAmount(enteredBalance))
          setIsAddingProtocol(false)
        }}
        disabled={!enteredProtocolMap}
      >
        Save
      </Button>
    </>
  )
}
