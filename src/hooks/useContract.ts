import { useWallet } from '../context/WalletManager'
import { useMemo } from 'react'
import { getContract } from '../utils'
import { Contract } from '@ethersproject/contracts'
import { ContractSources, SupportedProduct } from '../constants/types'
import { useNetwork } from '../context/NetworkManager'

export function useGetContract(source: ContractSources | undefined, hasSigner = true): Contract | null {
  const { library, account } = useWallet()

  return useMemo(() => {
    if (!source || !library) return null
    try {
      return getContract(source.addr, source.abi, library, hasSigner && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [source, library, hasSigner, account])
}

export function useGetProductContracts(): SupportedProduct[] {
  const { library, account } = useWallet()
  const { activeNetwork } = useNetwork()

  return useMemo(() => {
    const config = activeNetwork.config
    const cache = activeNetwork.cache
    if (!library || !cache) return []
    cache.supportedProducts.map((product: SupportedProduct, i: number) => {
      const name = product.name
      const productContractSources = config.productContracts[name]
      const contract = getContract(
        productContractSources.addr,
        productContractSources.abi,
        library,
        account ? account : undefined
      )
      cache.supportedProducts[i] = {
        ...product,
        contract: contract,
      }
    })
    return cache.supportedProducts
  }, [library, account, activeNetwork])
}

export function useContractArray(): ContractSources[] {
  const { activeNetwork } = useNetwork()

  return useMemo(() => {
    const config = activeNetwork.config
    const contractSources: ContractSources[] = []
    const excludedContractSources = [process.env.REACT_APP_RINKEBY_UNISWAP_LPTOKEN_ADDR]

    Object.keys(config.keyContracts).forEach((key) => {
      if (!excludedContractSources.includes(config.keyContracts[key].addr)) {
        contractSources.push({
          addr: config.keyContracts[key].addr.toLowerCase(),
          abi: config.keyContracts[key].abi,
        })
      }
    })
    Object.keys(config.productContracts).forEach((key) => {
      if (!excludedContractSources.includes(config.productContracts[key].addr)) {
        contractSources.push({
          addr: config.productContracts[key].addr.toLowerCase(),
          abi: config.productContracts[key].abi,
        })
      }
    })
    return contractSources
  }, [activeNetwork])
}
