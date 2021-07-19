import masterABI from '../constants/abi/contracts/Master.sol/Master.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import wethABI from '../constants/abi/contracts/mocks/WETH9.sol/WETH9.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'
import cpFarmABI from '../constants/abi/contracts/CpFarm.sol/CpFarm.json'
import lpFarmABI from '../constants/abi/contracts/SolaceEthLpFarm.sol/SolaceEthLpFarm.json'
import claimsEscrowABI from '../constants/abi/contracts/ClaimsEscrow.sol/ClaimsEscrow.json'
import lpTokenArtifact from '../../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import compAbi from '../constants/abi/contracts/products/CompoundProductRinkeby.sol/CompoundProductRinkeby.json'
import polMagABI from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'

import { ProductName } from '../constants/enums'
import { getTokens as comp4Tokens } from '../utils/positionGetters/compound/rinkeby/getTokens'
import { getBalances as comp4Balances } from '../utils/positionGetters/compound/rinkeby/getBalances'
import { getTokens as aave42Tokens } from '../utils/positionGetters/aave/getTokens'
import { getBalances as aave42Balances } from '../utils/positionGetters/aave/getBalances'

export const contractConfig: any = {
  '4': {
    keyContracts: {
      master: {
        addr: process.env.REACT_APP_RINKEBY_MASTER_ADDR,
        abi: masterABI,
      },
      vault: {
        addr: process.env.REACT_APP_RINKEBY_VAULT_ADDR,
        abi: vaultABI,
      },
      treasury: {
        addr: process.env.REACT_APP_RINKEBY_TREASURY_ADDR,
        abi: treasuryABI,
      },
      solace: {
        addr: process.env.REACT_APP_RINKEBY_SOLACE_ADDR,
        abi: solaceABI,
      },
      cpFarm: {
        addr: process.env.REACT_APP_RINKEBY_CPFARM_ADDR,
        abi: cpFarmABI,
      },
      lpFarm: {
        addr: process.env.REACT_APP_RINKEBY_LPFARM_ADDR,
        abi: lpFarmABI,
      },
      registry: {
        addr: process.env.REACT_APP_RINKEBY_REGISTRY_ADDR,
        abi: registryABI,
      },
      lpToken: {
        addr: process.env.REACT_APP_RINKEBY_UNISWAP_LPTOKEN_ADDR,
        abi: lpTokenArtifact.abi,
      },
      weth: {
        addr: process.env.REACT_APP_RINKEBY_WETH_ADDR,
        abi: wethABI,
      },
      claimsEscrow: {
        addr: process.env.REACT_APP_RINKEBY_CLAIMS_ESCROW_ADDR,
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: process.env.REACT_APP_RINKEBY_POLICY_MANAGER_ADDR,
        abi: polMagABI,
      },
    },
    productContracts: {
      [ProductName.COMPOUND]: {
        addr: process.env.REACT_APP_RINKEBY_COMPOUND_PRODUCT_ADDR,
        abi: compAbi,
      },
    },
    supportedProducts: [{ name: ProductName.COMPOUND }],
  },
  '42': {
    keyContracts: {
      master: {
        addr: process.env.REACT_APP_KOVAN_MASTER_ADDR,
        abi: masterABI,
      },
      vault: {
        addr: process.env.REACT_APP_KOVAN_VAULT_ADDR,
        abi: vaultABI,
      },
      treasury: {
        addr: process.env.REACT_APP_KOVAN_TREASURY_ADDR,
        abi: treasuryABI,
      },
      solace: {
        addr: process.env.REACT_APP_KOVAN_SOLACE_ADDR,
        abi: solaceABI,
      },
      cpFarm: {
        addr: process.env.REACT_APP_KOVAN_CPFARM_ADDR,
        abi: cpFarmABI,
      },
      lpFarm: {
        addr: process.env.REACT_APP_KOVAN_LPFARM_ADDR,
        abi: lpFarmABI,
      },
      registry: {
        addr: process.env.REACT_APP_KOVAN_REGISTRY_ADDR,
        abi: registryABI,
      },
      lpToken: {
        addr: process.env.REACT_APP_KOVAN_UNISWAP_LPTOKEN_ADDR,
        abi: lpTokenArtifact.abi,
      },
      weth: {
        addr: process.env.REACT_APP_KOVAN_WETH_ADDR,
        abi: wethABI,
      },
      claimsEscrow: {
        addr: process.env.REACT_APP_KOVAN_CLAIMS_ESCROW_ADDR,
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: process.env.REACT_APP_KOVAN_POLICY_MANAGER_ADDR,
        abi: polMagABI,
      },
    },
    productContracts: {
      [ProductName.AAVE]: {
        addr: process.env.REACT_APP_KOVAN_AAVE_PRODUCT_ADDR,
        abi: compAbi,
      },
    },
    supportedProducts: [{ name: ProductName.AAVE }],
  },
}

export const policyConfig: any = {
  '4': {
    productsRev: {
      [String(process.env.REACT_APP_RINKEBY_COMPOUND_PRODUCT_ADDR)]: ProductName.COMPOUND,
    },
    getTokens: comp4Tokens,
    getBalances: comp4Balances,
    initialized: false,
  },
  '42': {
    productsRev: {
      [String(process.env.REACT_APP_KOVAN_AAVE_PRODUCT_ADDR)]: ProductName.AAVE,
    },
    getTokens: aave42Tokens,
    getBalances: aave42Balances,
    initialized: false,
  },
}
