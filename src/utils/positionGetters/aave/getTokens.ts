import { Contract, providers } from 'ethers'
import { ZERO } from '../../../constants'
import { Token } from '../../../constants/types'
import ierc20Json from '../../contracts/IERC20Metadata.json'
import { AaveProtocolDataProviderFactory } from './contracts/AaveProtocolDataProviderFactory'
const KEY = process.env.REACT_APP_ALCHEMY_API_KEY
if (KEY === '') throw new Error('ENV ALCHEMY KEY not configured')

type Market = {
  market: string
  nodeUrl: string
  protocolDataProviderAddress: string
}

const NETWORKS_CONFIG: any = {
  '4': [
    {
      market: 'proto',
      nodeUrl: `https://eth-mainnet.alchemyapi.io/v2/${KEY}`,
      protocolDataProviderAddress: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
    },
    {
      market: 'amm',
      nodeUrl: `https://eth-mainnet.alchemyapi.io/v2/${KEY}`,
      protocolDataProviderAddress: '0xc443ad9dde3cecfb9dfc5736578f447afe3590ba',
    },
  ],
  '42': [
    {
      market: 'proto',
      nodeUrl: `https://eth-kovan.alchemyapi.io/v2/${KEY}`,
      protocolDataProviderAddress: '0x3c73a5e5785cac854d468f727c606c07488a29d6',
    },
  ],
  '137': [
    {
      market: 'matic',
      nodeUrl: `https://rpc-mainnet.matic.network`,
      protocolDataProviderAddress: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
    },
  ],
} as const

const generateTokensData = async (
  chainId: number,
  nodeUrl: string,
  market: string,
  protocolDataProviderAddress: string
): Promise<Token[]> => {
  const provider = new providers.JsonRpcProvider(nodeUrl)
  const helperContract = AaveProtocolDataProviderFactory.connect(protocolDataProviderAddress, provider)

  try {
    const [tokens, aTokens] = await Promise.all([helperContract.getAllReservesTokens(), helperContract.getAllATokens()])
    const promises = tokens.map(async (token) => {
      const [reserve, config] = await Promise.all([
        helperContract.getReserveTokensAddresses(token.tokenAddress),
        helperContract.getReserveConfigurationData(token.tokenAddress),
      ])

      const aToken = aTokens.find((aToken) => aToken.tokenAddress === reserve.aTokenAddress)
      if (!aToken)
        return {
          token: {
            address: '',
            name: '',
            symbol: '',
            decimals: 0,
            balance: ZERO,
          },
          underlying: {
            address: '',
            name: '',
            symbol: '',
            decimals: 0,
            balance: ZERO,
          },
          eth: {
            balance: ZERO,
          },
        }

      const aTokenContract = new Contract(aToken.tokenAddress, ierc20Json.abi, provider)
      const tokenContract = new Contract(token.tokenAddress, ierc20Json.abi, provider)
      const aTokenName: string = await aTokenContract.name()
      const tokenName: string = await tokenContract.name()

      return {
        token: {
          address: reserve.aTokenAddress,
          name: aTokenName,
          symbol: aToken ? aToken.symbol : '',
          decimals: config.decimals.toNumber(),
          balance: ZERO,
        },
        underlying: {
          address: token.tokenAddress,
          name: tokenName,
          symbol: token.symbol,
          decimals: config.decimals.toNumber(),
          balance: ZERO,
        },
        eth: {
          balance: ZERO,
        },
      }
    })

    const result = await Promise.all(promises)
    return result
  } catch (error) {
    console.error(`Error network : ${chainId}`, error)
    return []
  }
}

export const getTokens = async (provider: any): Promise<Token[]> => {
  if (!provider) return []
  const network = await provider.getNetwork()
  const chainId = network.chainId
  let allTokens: Token[] = []
  await Promise.all(
    NETWORKS_CONFIG[String(chainId)].map((marketConfig: Market) =>
      generateTokensData(
        chainId,
        marketConfig.nodeUrl,
        marketConfig.market,
        marketConfig.protocolDataProviderAddress
      ).then((marketTokens: Token[]) => (allTokens = allTokens.concat(marketTokens)))
    )
  )
  return allTokens
}
