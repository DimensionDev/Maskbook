// Versioned independently from transaction responses. Source:

import { ChainId } from '@masknet/web3-shared-evm'

// https://web3.okx.com/onchainos/dev-docs/trade/dex-smart-contract
const OKX_TOKEN_APPROVE_ADDRESSES: Readonly<Partial<Record<ChainId, string>>> = {
    [ChainId.Arbitrum]: '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
    [ChainId.Avalanche]: '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
    [ChainId.Base]: '0x57df6092665eb6058DE53939612413ff4B09114E',
    [ChainId.Conflux]: '0x68D6B739D2020067D1e2F713b999dA97E4d54812',
    [ChainId.Cronos]: '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
    [ChainId.Fantom]: '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
    [ChainId.Mainnet]: '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
    [ChainId.Metis]: '0x57df6092665eb6058DE53939612413ff4B09114E',
    [ChainId.OKXChain]: '0x70cbb871e8f30fc8ce23609e9e0ea87b6b222f58',
    [ChainId.Optimism]: '0x68D6B739D2020067D1e2F713b999dA97E4d54812',
    [ChainId.Polygon]: '0x3B86917369B83a6892f553609F3c2F439C184e31',
    [ChainId.Robinhood]: '0x42170295F1173c9e5874ea9d00c6d137E1a4f53d',
    [ChainId.Scroll]: '0x57df6092665eb6058DE53939612413ff4B09114E',
    [ChainId.XLayer]: '0x8b773D83bc66Be128c60e07E17C8901f7a64F000',
}

/**
 * Approval targets are security-sensitive and must not be selected by the same
 * response that supplies the transaction calldata.
 */
export function getOKXTokenApproveAddress(chainId: ChainId | undefined) {
    if (!chainId) return
    return OKX_TOKEN_APPROVE_ADDRESSES[chainId]
}
