import React, { useEffect, useMemo, useState } from 'react'
import { capitalizeFirstLetter } from '../../utils/formatting'
import { Flex } from '../../components/atoms/Layout'
import { CustomTooltip } from '../../components/organisms/CustomTooltip'
import { useDistributedColors } from '../../hooks/internal/useDistributedColors'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { calculateMonthlyTicks, xtickLabelFormatter } from '../../utils/chart'
import { formatCurrency } from '../../utils/formatting'
import { useAnalyticsContext } from './AnalyticsContext'
import { Text } from '../../components/atoms/Typography'
import { Loader } from '../../components/atoms/Loader'
import vegaEmbed from 'vega-embed'
import { useGeneral } from '../../context/GeneralManager'

export const TokenScatterPlotMatrix = () => {
  const { width, isMobile } = useWindowDimensions()
  const { intrface, data } = useAnalyticsContext()
  const { canSeeTokenVolatilities } = intrface
  const { allDataPortfolio, activeTickerSymbol, setActiveTickerSymbol } = data
  const { appTheme } = useGeneral()

  const fetchVega = (dataIn: any, theme: 'light' | 'dark', chartDataIndex: number) => {
    vegaEmbed('#vis4', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: {
        text: `${allDataPortfolio[chartDataIndex].symbol.toUpperCase()} Token Relationship with WETH`,
        color: theme == 'light' ? 'black' : 'white',
        font: 'Montserrat',
      },
      config: {
        style: { cell: { stroke: 'transparent' } },
        // axis: { labelColor: theme == 'light' ? 'black' : 'white' },
        axis: {
          labelColor: theme == 'light' ? 'black' : 'white',
          tickColor: '#bebec8',
          titleColor: theme == 'light' ? 'black' : 'white',
          titleFontWeight: 'normal',
          titleFontSize: 16,
          labelFont: 'Montserrat',
          titleFont: 'Montserrat',
        },
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
        values: dataIn /* .map((item: any) => {
          return {
            x: 2,
            y: 2,
          }
        }) */,
      },
      mark: { type: 'point' },
      encoding: {
        x: {
          field: 'x',
          type: 'quantitative',
          scale: { zero: false, domain: [0.5, 1.5] },
          axis: { title: `${allDataPortfolio[chartDataIndex].symbol.toUpperCase()}`, grid: false },
        },
        y: {
          field: 'y',
          type: 'quantitative',
          scale: { zero: false, domain: [0.5, 1.5] },
          axis: { title: 'WETH Daily % Price Change', grid: false },
        },
        color: {
          field: 'Data Type',
          type: 'nominal',
          scale: { range: ['#F04D42', '#D478D8', '#5F5DF9'] }, // solace brand colors
          value: '#F04D42', // ???
          // legend: null,
          legend: {
            titleColor: theme == 'light' ? 'black' : 'white',
            labelColor: theme == 'light' ? 'black' : 'white',
          },
        },
        shape: { field: 'Data Type', type: 'nominal', scale: { range: ['circle', 'square', 'triangle'] } },
      },
    })
  }

  useEffect(() => {
    console.log('tickerSymbol', activeTickerSymbol)
    if (!activeTickerSymbol) {
      // we must set tickerSymbol to the symbol with the highest weight in the portfolio
      const highestWeightTicker = allDataPortfolio.length
        ? allDataPortfolio.reduce((prev, current) => (prev.weight > current.weight ? prev : current))
        : undefined
      if (highestWeightTicker) setActiveTickerSymbol(highestWeightTicker.symbol)
    }
    if (activeTickerSymbol.length === 0 || !canSeeTokenVolatilities) return
    const chartDataIndex = allDataPortfolio.findIndex((x) => x.symbol === activeTickerSymbol)
    const chartDataIndexETH = allDataPortfolio.findIndex((x) => x.symbol === 'weth')
    console.log('allDataPortfolio', allDataPortfolio)
    console.log('chartDataIndex', chartDataIndex)
    /* 
          let vegaData: any = {
          table: [
            { a: 1, b: 1 },
            { a: 1, b: 1 },
            { a: 1, b: 1 }
          ]
          };
    */
    const reformatedData1: any = []
    let temp1: { x: number }[] = []
    let temp2: { y: number }[] = []
    temp1 = allDataPortfolio[chartDataIndex].simulation.map((item: number) => {
      return {
        x: item,
      }
    })
    temp2 = allDataPortfolio[chartDataIndexETH].simulation.map((item: number) => {
      return {
        y: item,
      }
    })
    for (let j = 0; j < temp1.length; j++) {
      reformatedData1.push({
        x: temp1[j].x,
        y: temp2[j].y,
        'Data Type': 'History',
      })
    }
    console.log('temp1', reformatedData1)
    fetchVega(reformatedData1, appTheme, chartDataIndex)
  }, [canSeeTokenVolatilities, activeTickerSymbol, appTheme])

  return (
    <>
      {canSeeTokenVolatilities ? (
        <Flex id="vis4" widthP={100} justifyCenter>
          <Text autoAlign>data not available</Text>
        </Flex>
      ) : canSeeTokenVolatilities == false ? (
        <Text textAlignCenter t2>
          This chart cannot be viewed at this time
        </Text>
      ) : (
        <Loader />
      )}
    </>
  )
}
