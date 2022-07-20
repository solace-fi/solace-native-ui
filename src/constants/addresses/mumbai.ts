import { SOLACE_TOKEN, XSOLACE_TOKEN } from '../mappings/token'

export const KEY_ADDRS = {
  SOLACE: SOLACE_TOKEN.address[80001],
  XSLOCKER: '0x501Ace47c5b0C2099C4464f681c3fa2ECD3146C1',
  XSOLACE: XSOLACE_TOKEN.address[80001],
}

export const TELLER_ADDRS_V2 = {
  MATIC_TELLER: '0x501aCe133452D4Df83CA68C684454fCbA608b9DD',
  DAI_TELLER: '0x501ACe677634Fd09A876E88126076933b686967a',
  WETH_TELLER: `0x501Ace367f1865DEa154236D5A8016B80a49e8a9`,
  USDC_TELLER: `0x501ACE7E977e06A3Cb55f9c28D5654C9d74d5cA9`,
  WBTC_TELLER: `0x501aCEF0d0c73BD103337e6E9Fd49d58c426dC27`,
  USDT_TELLER: `0x501ACe5CeEc693Df03198755ee80d4CE0b5c55fE`,
  FRAX_TELLER: `0x501aCef4F8397413C33B13cB39670aD2f17BfE62`,
}

export const SPECIAL_ADDRS = {
  BSOLACE: '0xB18033769f62EEe27e63f85224d86f1b4F2478C9',
  BRIDGE_WRAPPER: '0x501AcE1a18aB550E4E8c7775a23d96fD290b0BbF',
}
