/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import context
    import components
    import hooks
    import utils

    styled components

    ProtocolStep function
      custom hooks
      useState hooks
      Local functions
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useState } from 'react'

/* import packages */
import styled from 'styled-components'
import useDebounce from '@rooks/use-debounce'

/* import constants */
import { DAYS_PER_YEAR, DEFAULT_CHAIN_ID, NUM_BLOCKS_PER_DAY } from '../../constants'

/* import context */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Button } from '../../components/atoms/Button'
import { formProps } from './MultiStepForm'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/atoms/Table'
import { Search } from '../../components/atoms/Input'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/atoms/Protocol'
import { Card, CardContainer } from '../../components/atoms/Card'
import { ModalRow } from '../../components/atoms/Modal'
import { FormCol } from '../../components/atoms/Form'
import { Content } from '../../components/atoms/Layout'

/* import hooks */
import { useGetAvailableCoverages, useGetYearlyCosts } from '../../hooks/usePolicy'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixed, getNativeTokenUnit } from '../../utils/formatting'

/*************************************************************************************

  styled components

  *************************************************************************************/
const ActionsContainer = styled.div`
  padding: 20px 5px 0;
  display: flex;
  align-items: center;
  ${Search} {
    width: 300px;
  }

  @media screen and (max-width: ${600}px) {
    justify-content: center;
  }
`

export const ProtocolStep: React.FC<formProps> = ({ setForm, navigation }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const availableCoverages = useGetAvailableCoverages()
  const yearlyCosts = useGetYearlyCosts()
  const { products, setSelectedProtocolByName } = useContracts()
  const { chainId, errors } = useWallet()
  const { width } = useWindowDimensions()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [searchValue, setSearchValue] = useState<string>('')

  /*************************************************************************************

  Local functions

  *************************************************************************************/

  const handleChange = (selectedProtocol: any) => {
    setSelectedProtocolByName(selectedProtocol.name)
    setForm({
      target: {
        name: 'protocol',
        value: selectedProtocol,
      },
    })
    navigation.next()
  }

  const handleSearch = useDebounce((searchValue: string) => {
    setSearchValue(searchValue)
  }, 300)

  const handleAvailableCoverage = (protocol: string) => {
    if (!availableCoverages[protocol]) return '0'
    return availableCoverages[protocol].split('.')[0]
  }

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Fragment>
      <ActionsContainer>
        <Search type="search" placeholder="Search" onChange={(e) => handleSearch(e.target.value)} />
      </ActionsContainer>
      <Content>
        {width > 600 ? (
          <Table canHover>
            <TableHead>
              <TableRow>
                <TableHeader>Protocol</TableHeader>
                <TableHeader>Yearly Cost</TableHeader>
                <TableHeader>Coverage Available</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {products
                .map((product) => {
                  return product.name
                })
                .filter((protocol: string) => protocol.toLowerCase().includes(searchValue.toLowerCase()))
                .map((protocol: string) => {
                  return (
                    <TableRow
                      key={protocol}
                      onClick={
                        errors.length > 0
                          ? undefined
                          : () =>
                              handleChange({
                                name: protocol,
                                availableCoverage: handleAvailableCoverage(protocol),
                                yearlyCost:
                                  parseFloat(yearlyCosts[protocol] ?? '0') *
                                  Math.pow(10, 6) *
                                  NUM_BLOCKS_PER_DAY *
                                  DAYS_PER_YEAR,
                              })
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      <TableData>
                        <Protocol>
                          <ProtocolImage mr={10}>
                            <img src={`https://assets.solace.fi/${protocol.toLowerCase()}`} />
                          </ProtocolImage>
                          <ProtocolTitle>{protocol}</ProtocolTitle>
                        </Protocol>
                      </TableData>
                      <TableData>
                        {fixed(
                          parseFloat(yearlyCosts[protocol] ?? '0') *
                            Math.pow(10, 6) *
                            NUM_BLOCKS_PER_DAY *
                            DAYS_PER_YEAR *
                            100,
                          2
                        )}
                        %
                      </TableData>
                      <TableData>
                        {handleAvailableCoverage(protocol)} {getNativeTokenUnit(chainId ?? DEFAULT_CHAIN_ID)}
                      </TableData>
                      <TableData textAlignRight>
                        <Button disabled={errors.length > 0}>Select</Button>
                      </TableData>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        ) : (
          <CardContainer cardsPerRow={2}>
            {products
              .map((product) => {
                return product.name
              })
              .filter((protocol: string) => protocol.toLowerCase().includes(searchValue.toLowerCase()))
              .map((protocol: string) => {
                return (
                  <Card
                    key={protocol}
                    onClick={
                      errors.length > 0
                        ? undefined
                        : () =>
                            handleChange({
                              name: protocol,
                              availableCoverage: handleAvailableCoverage(protocol),
                              yearlyCost:
                                parseFloat(yearlyCosts[protocol] ?? '0') *
                                Math.pow(10, 6) *
                                NUM_BLOCKS_PER_DAY *
                                DAYS_PER_YEAR,
                            })
                    }
                  >
                    <ModalRow>
                      <FormCol>
                        <ProtocolImage mr={10}>
                          <img src={`https://assets.solace.fi/${protocol.toLowerCase()}`} />
                        </ProtocolImage>
                      </FormCol>
                      <FormCol style={{ display: 'flex', alignItems: 'center' }}>{protocol}</FormCol>
                    </ModalRow>
                    <ModalRow>
                      <FormCol>Yearly Cost</FormCol>
                      <FormCol>
                        {fixed(
                          parseFloat(yearlyCosts[protocol] ?? '0') *
                            Math.pow(10, 6) *
                            NUM_BLOCKS_PER_DAY *
                            DAYS_PER_YEAR *
                            100,
                          2
                        )}
                        %
                      </FormCol>
                    </ModalRow>
                    <ModalRow>
                      <FormCol>Coverage Available</FormCol>
                      <FormCol>
                        {handleAvailableCoverage(protocol)} {getNativeTokenUnit(chainId ?? DEFAULT_CHAIN_ID)}
                      </FormCol>
                    </ModalRow>
                  </Card>
                )
              })}
          </CardContainer>
        )}
      </Content>
    </Fragment>
  )
}
