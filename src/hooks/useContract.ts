import { useWallet } from '../context/WalletManager'
import { useMemo, useState } from 'react'
import { getContract } from '../utils'
import { Contract } from '@ethersproject/contracts'
import { contractConfig } from '../config/chainConfig'
import { ContractSources, SupportedProduct } from '../constants/types'

export function useGetContract(address: string, abi: any, hasSigner = true): Contract | null {
  const { library, account } = useWallet()

  return useMemo(() => {
    if (!address || !abi || !library) return null
    try {
      return getContract(address, abi, library, hasSigner && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, abi, library, hasSigner, account])
}

export function useGetProductContracts(): SupportedProduct[] {
  const { library, account, chainId } = useWallet()
  const _contractConfig = contractConfig[String(chainId)]

  return useMemo(() => {
    if (!library) return []
    const signer = account ? true : false
    for (let i = 0; i < _contractConfig.supportedProducts.length; i++) {
      const name = _contractConfig.supportedProducts[i].name
      if (!_contractConfig.supportedProducts[i].contract || signer !== _contractConfig.supportedProducts[i].signer) {
        const productContractSources = _contractConfig.productContracts[name]
        const contract = getContract(
          productContractSources.addr,
          productContractSources.abi,
          library,
          account ? account : undefined
        )
        _contractConfig.supportedProducts[i] = {
          ..._contractConfig.supportedProducts[i],
          contract: contract,
          signer: signer,
        }
      }
    }
    return _contractConfig.supportedProducts
  }, [library, account, _contractConfig.supportedProducts, _contractConfig.productContracts])
}

export function useContractArray(): ContractSources[] {
  const { chainId } = useWallet()
  const _contractConfig = contractConfig[String(chainId)]
  const [contractSources, setContractSources] = useState<ContractSources[]>([])

  useMemo(() => {
    const arr: ContractSources[] = []
    Object.keys(_contractConfig.keyContracts).forEach((key) => {
      arr.push({
        addr: _contractConfig.keyContracts[key].addr.toLowerCase(),
        abi: _contractConfig.keyContracts[key].abi,
      })
    })
    Object.keys(_contractConfig.productContracts).forEach((key) => {
      arr.push({
        addr: _contractConfig.productContracts[key].addr.toLowerCase(),
        abi: _contractConfig.productContracts[key].abi,
      })
    })
    setContractSources(arr)
  }, [_contractConfig.keyContracts, _contractConfig.productContracts])

  return contractSources
}
