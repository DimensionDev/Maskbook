import { ChainId } from '@masknet/web3-shared-evm'
import Coingecko from '@masknet/web3-constants/evm/coingecko.json'

export const COINGECKO_URL_BASE = 'https://coingecko-agent.r2d2.to/api/v3'
export const COINGECKO_CHAIN_ID_LIST = [
    ChainId.Mainnet,
    ChainId.BSC,
    ChainId.Base,
    ChainId.Polygon,
    ChainId.Arbitrum,
    ChainId.xDai,
    ChainId.Optimism,
    ChainId.Avalanche,
    ChainId.Celo,
    ChainId.Fantom,
    ChainId.Aurora,
    ChainId.Conflux,
    ChainId.Astar,
    ChainId.Pulse,
    ChainId.Moonbeam,
    ChainId.Klaytn,
    ChainId.Moonriver,
    ChainId.Harmony,
    ChainId.Cronos,
    ChainId.BitTorrent,
    ChainId.Boba,
]

if (process.env.NODE_ENV === 'development') {
    const NonEmptyChainIds = Object.entries(Coingecko.COIN_ID).filter((x) => x[1])
    console.assert(
        NonEmptyChainIds.length === COINGECKO_CHAIN_ID_LIST.length,
        "COINGECKO_CHAIN_ID_LIST doesn't align to coingecko.json",
    )
}
