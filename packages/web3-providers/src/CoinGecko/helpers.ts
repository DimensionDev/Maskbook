import { createLookupTableResolver } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ChainId } from '@masknet/web3-shared-evm'
import { ChainId as ChainIdSolana } from '@masknet/web3-shared-solana'

export const resolveCoinGeckoChainId = createLookupTableResolver<string, Web3Helper.ChainIdAll | undefined>(
    {
        ethereum: ChainId.Mainnet,
        'binance-smart-chain': ChainId.BSC,
        'polygon-pos': ChainId.Polygon,
        solana: ChainIdSolana.Mainnet,
        astar: ChainId.Astar,
        aurora: ChainId.Aurora,
        avalanche: ChainId.Avalanche,
        'arbitrum-nova': ChainId.Arbitrum,
        boba: ChainId.Boba,
        conflux: ChainId.Conflux,
        fantom: ChainId.Fantom,
        fuse: ChainId.Fuse,
        moonbeam: ChainId.Moonbeam,
        'optimistic-ethereum': ChainId.Optimism,
        xdai: ChainId.xDai,
    },
    undefined,
)
