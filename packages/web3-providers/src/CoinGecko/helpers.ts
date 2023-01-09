import { createLookupTableResolver } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ChainId } from '@masknet/web3-shared-evm'
import { ChainId as ChainIdSolana } from '@masknet/web3-shared-solana'

export const resolveCoinGeckoChainId = createLookupTableResolver<string, Web3Helper.ChainIdAll | undefined>(
    {
        ethereum: ChainId.Mainnet,
        'binance-smart-chain': ChainId.BSCT,
        'polygon-pos': ChainId.Matic,
        solana: ChainIdSolana.Mainnet,
    },
    undefined,
)
