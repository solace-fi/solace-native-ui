import { useState, useEffect, useMemo } from 'react'
import { fetchGasPrice } from '../utils/etherscan'
import { useWallet } from '../context/WalletManager'
import { DEFAULT_CHAIN_ID } from '../constants'

export type GasFeeOption = {
  key: string
  name: string
  value: number
}

type GasFeeListState = {
  options: GasFeeOption[]
  loading: boolean
  selected?: GasFeeOption
}

export type GasFeeListProps = {
  option?: GasFeeOption
  onChange?: (value: GasFeeOption) => void
}

export const useFetchGasPrice = (): GasFeeListState => {
  const { version, chainId } = useWallet()

  const [state, setState] = useState<GasFeeListState>({
    options: [],
    loading: true,
    selected: undefined,
  })

  useEffect(() => {
    const fetchGasPrices = async () => {
      await fetchGasPrice(chainId ?? Number(DEFAULT_CHAIN_ID))
        .then((result) => {
          const options = [
            {
              key: 'safeLow',
              name: 'Slow',
              value: result.safeLow != NaN ? result.safeLow : state.options[0].value,
            },
            {
              key: 'average',
              name: 'Standard',
              value: result.average != NaN ? result.average : state.options[1].value,
            },
            {
              key: 'fast',
              name: 'Fast',
              value: result.fast != NaN ? result.fast : state.options[2].value,
            },
            {
              key: 'fastest',
              name: 'Very fast',
              value: result.veryFast != NaN ? result.veryFast : state.options[3].value,
            },
          ]
          setState({
            loading: false,
            options,
            selected: options[1],
          })
        })
        .catch(() => {
          setState({
            ...state,
            loading: false,
          })
        })
    }
    fetchGasPrices()
  }, [version, chainId])

  return state
}
