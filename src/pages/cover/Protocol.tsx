import React, { useEffect, useMemo, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { Button, GraySquareButton, ThinButton } from '../../components/atoms/Button'
import { capitalizeFirstLetter, filterAmount } from '../../utils/formatting'
import { LocalSolaceRiskProtocol } from '../../constants/types'
import { useCoverageContext } from './CoverageContext'
import { Accordion } from '../../components/atoms/Accordion'
import { TileCard } from '../../components/molecules/TileCard'
import { DropdownOptionsUnique, processProtocolName } from './Dropdown'
import { StyledArrowDropDown, StyledClose, StyledHelpCircle } from '../../components/atoms/Icon'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import usePrevious from '../../hooks/internal/usePrevious'
import useDebounce from '@rooks/use-debounce'

function mapNumberToLetter(number: number): string {
  return String.fromCharCode(97 + number - 1).toUpperCase()
}

export const Protocol: React.FC<{
  protocol: LocalSolaceRiskProtocol
  editableProtocolAppIds: string[]
  riskColor: string
  simulating: boolean
  editingItem: string | undefined
  // addItem: (index?: number | undefined) => void
  deleteItem: (targetAppId: string) => void
  editId: (targetAppId: string, newAppId: string) => void
  editAmount: (targetAppId: string, newAmount: string) => void
  handleEditingItem: (appId: string | undefined) => void
}> = ({
  protocol,
  editableProtocolAppIds,
  riskColor,
  simulating,
  editingItem,
  // addItem,
  deleteItem,
  editId,
  editAmount,
  handleEditingItem,
}): JSX.Element => {
  const { seriesKit, styles } = useCoverageContext()
  const { series, seriesLogos } = seriesKit
  const { gradientStyle } = styles

  const [protocolsOpen, setProtocolsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [enteredAmount, setEnteredAmount] = useState(
    protocol.balanceUSD.toString() == '0' ? '' : protocol.balanceUSD.toString()
  )
  const [searchTerm, setSearchTerm] = useState('')

  const simulatingPrev = usePrevious(simulating)

  const isValidProtocol = useMemo(() => {
    if (!series) return false
    return series.data.protocolMap.find((p) => p.appId.toLowerCase() == protocol.appId.toLowerCase())
  }, [protocol, series])

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

  const cachedDropdownOptions = useMemo(
    () => (
      <DropdownOptionsUnique
        comparingList={editableProtocolAppIds}
        isOpen={dropdownOpen}
        searchedList={activeList}
        noneText={'No matching protocols found'}
        onClick={(value: string) => {
          editId(protocol.appId, value)
          handleEditingItem(undefined)
          setDropdownOpen(false)
          // setProtocolsOpen(false)
        }}
      />
    ),
    [editId, editableProtocolAppIds, handleEditingItem, dropdownOpen, protocol.appId, activeList]
  )

  const _editAmount = useDebounce(() => {
    editAmount(protocol.appId, enteredAmount)
  }, 300)

  // useEffect(() => {
  //   if (!simulatingPrev && simulating) close()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [simulatingPrev, simulating])

  useEffect(() => {
    _editAmount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredAmount])

  useEffect(() => {
    setEnteredAmount(protocol.balanceUSD.toString() == '0' ? '' : protocol.balanceUSD.toString())
  }, [protocol.balanceUSD])

  useEffect(() => {
    if (!protocolsOpen) {
      setTimeout(() => {
        setDropdownOpen(false)
      }, 100)
    } else {
      setDropdownOpen(true)
    }
  }, [protocolsOpen])

  useEffect(() => {
    if (!editingItem || (editingItem && editingItem.toString() !== protocol.appId.toString())) {
      // setProtocolsOpen(false)
      setDropdownOpen(false)
    }
  }, [editingItem, protocol.appId])

  return (
    <div>
      <TileCard
        padding={16}
        onClick={() => {
          !protocolsOpen && setProtocolsOpen(true)
          protocolsOpen && handleEditingItem(protocol.appId)
        }}
        style={{ position: 'relative', width: '100%', cursor: protocolsOpen ? 'default' : 'pointer' }}
      >
        {/* <Button
          {...gradientStyle}
          width={30}
          height={30}
          onClick={() => addItem(protocol.index - 1)}
          noborder
          nohover
          style={{ position: 'absolute', top: '0px', left: '0px' }}
        >
          <StyledAdd size={20} />
        </Button> */}
        {/* <Button
          {...gradientStyle}
          width={30}
          height={30}
          onClick={() => addItem(protocol.index)}
          noborder
          nohover
          style={{ position: 'absolute', bottom: '0px', left: '0px' }}
        >
          <StyledAdd size={20} />
        </Button> */}
        {/* <Button
          width={30}
          height={30}
          style={{ position: 'absolute', top: '0px', right: '0px' }}
          noborder
          nohover
          error
          onClick={() => deleteItem(protocol.appId)}
        >
          <StyledClose size={16} />
        </Button> */}
        <Flex col gap={8}>
          <Flex stretch between gap={10}>
            {/* <div style={{ background: 'red', height: '32px' }}> aAa </div> */}
            {protocolsOpen ? (
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
                        {isValidProtocol ? (
                          <img src={`https://assets.solace.fi/zapperLogos/${protocol.appId}`} height={16} />
                        ) : (
                          // <StyledHelpCircle size={16} />
                          <></>
                        )}
                      </Text>
                      <Text t5s style={!isValidProtocol ? { width: '100%' } : {}}>
                        {/* {capitalizeFirstLetter(protocol.appId.includes('Empty') ? 'Choose Protocol' : protocol.appId)} */}
                        {isValidProtocol ? (
                          processProtocolName(protocol.appId)
                        ) : (
                          <Flex between>
                            <Text t5s>
                              {capitalizeFirstLetter(
                                protocol.appId.includes('Empty') ? 'Choose Protocol' : protocol.appId
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
                  placeholder={'Cover limit'}
                  value={enteredAmount}
                  onChange={(e) => setEnteredAmount(filterAmount(e.target.value, enteredAmount))}
                  style={{
                    maxWidth: '106px',
                    width: '106px',
                    minWidth: '106px',
                    maxHeight: '32px',
                  }}
                  asideBg
                />
                <GraySquareButton width={32} height={32} noborder onClick={() => setProtocolsOpen(false)} darkText>
                  <StyledClose size={16} />
                </GraySquareButton>
              </>
            ) : (
              <div
                style={{
                  width: '100%',
                }}
              >
                <Flex between>
                  <Flex itemsCenter gap={8}>
                    {/* protocol icon */}
                    <Text autoAlignVertical>
                      {isValidProtocol ? (
                        <img src={`https://assets.solace.fi/zapperLogos/${protocol.appId}`} height={36} />
                      ) : (
                        <StyledHelpCircle size={36} />
                      )}
                    </Text>
                    <Flex col gap={5}>
                      {/* protocol name */}
                      <Text t5s bold>
                        {capitalizeFirstLetter(
                          protocol.appId.includes('Empty') ? 'Empty' : processProtocolName(protocol.appId)
                        )}
                      </Text>
                      {/* protocol category */}
                      <Text t5s>{capitalizeFirstLetter(protocol.category)}</Text>
                    </Flex>
                  </Flex>
                  <Flex col itemsEnd gap={2}>
                    {/* balance */}
                    <Flex itemsCenter>
                      <Text t3s bold>
                        ${protocol.balanceUSD.toString() == '0' ? '0' : protocol.balanceUSD.toString()}
                      </Text>
                    </Flex>
                    {/* risl level */}
                    <Flex itemsCenter gap={4}>
                      <Text t6s>Risk Level:</Text>
                      <Text t6s extrabold warmgradient>
                        {mapNumberToLetter(protocol.tier > 0 ? protocol.tier : 25)}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </div>
            )}
            {protocolsOpen && <></>}
            {/* </InputSectionWrapper> */}
          </Flex>
        </Flex>
        {protocolsOpen && (
          <Flex gap={8} mt={12}>
            <Button
              height={32}
              error
              onClick={() => deleteItem(protocol.appId)}
              width={100}
              style={{ borderRadius: '8px' }}
            >
              <Flex gap={4} itemsCenter>
                <StyledClose size={13.33} />
                <Text t5s bold>
                  Remove
                </Text>
              </Flex>
            </Button>
            <Button
              height={32}
              techygradient
              secondary
              noborder
              onClick={() => setProtocolsOpen(false)}
              style={{ width: '100%', borderRadius: '8px' }}
            >
              <Flex gap={4} itemsCenter>
                <Text t5s bold>
                  Save
                </Text>
              </Flex>
            </Button>
          </Flex>
        )}
        <Accordion noScroll isOpen={protocolsOpen} style={{ backgroundColor: 'inherit' }}>
          {/* <div style={{ padding: 8 }}> */}
          <Flex col gap={8} mt={12}>
            <div>
              {dropdownOpen && (
                <SmallerInputSection
                  placeholder={'Search Protocol'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                  }}
                />
              )}
              {/* <GenericInputSection
                placeholder={'Search Protocol'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                h={32}
              /> */}
              {dropdownOpen && cachedDropdownOptions}
            </div>
          </Flex>
          {/* </div> */}
        </Accordion>
      </TileCard>
    </div>
  )
}
