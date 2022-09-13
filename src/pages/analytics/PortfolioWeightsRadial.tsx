import React, { useEffect, useMemo, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { Flex } from '../../components/atoms/Layout'
import { useGeneral } from '../../context/GeneralManager'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useAnalyticsContext } from './AnalyticsContext'

export const PortfolioWeightsRadial = () => {
  const { appTheme } = useGeneral()
  const { isMobile } = useWindowDimensions()
  const { data } = useAnalyticsContext()
  const { allDataPortfolio } = data
  const [tickerSymbol, setTickerSymbol] = useState('')
  const [displayVega, setDisplayVega] = useState(false)

  const fetchVega = (dataIn: any, theme: 'light' | 'dark') => {
    vegaEmbed('#vis3', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: 'Token Weights', color: theme == 'light' ? 'black' : 'white' },
      config: {
        style: { cell: { stroke: 'transparent' } },
        axis: { labelColor: theme == 'light' ? 'black' : 'white' },
        font: 'Montserrat',
      },
      background: 'transparent',
      width: 'container',
      height: 300,
      autosize: {
        type: 'fit',
        contains: 'padding',
        resize: true,
      },
      data: {
        name: 'table',
        values: dataIn.map((item: any) => {
          return {
            weight: item.weight,
            symbol: item.symbol,
          }
        }),
      },
      // This is if you want a radial pie chart
      layer: [
        {
          mark: { type: 'arc', innerRadius: 20, stroke: '#fff' },
        },
        {
          mark: { type: 'text', radiusOffset: 10 },
          encoding: {
            text: { field: 'symbol' },
          },
        },
      ],
      encoding: {
        theta: { field: 'weight', type: 'quantitative', stack: true },
        radius: { field: 'weight', scale: { type: 'sqrt', zero: true, rangeMin: 20 } },
        color: { field: 'weight', type: 'nominal', legend: null },
      },
    })
  }

  useEffect(() => {
    setDisplayVega(true) //TODO ???
    fetchVega(allDataPortfolio, appTheme)
  }, [allDataPortfolio])

  // Hmm twice? can we move appTheme up to [tickerSymbol,appTheme] ?
  useEffect(
    () => {
      fetchVega(allDataPortfolio, appTheme)
    },
    [appTheme] // eslint-disable-next-line react-hooks/exhaustive-deps
  )

  return (
    <Flex gap={10} col={isMobile}>
      <Flex id="vis3" widthP={100} justifyCenter>
        <Text autoAlign>data not available</Text>
      </Flex>
    </Flex>
  )
}
