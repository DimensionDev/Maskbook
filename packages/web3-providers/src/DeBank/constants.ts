import { ChainId } from '@masknet/web3-shared-evm'
import type { DebankChains } from './types.js'

export const DEBANK_OPEN_API = 'https://debank-proxy.r2d2.to'

export const DEBANK_CHAIN_TO_CHAIN_ID_MAP: Record<DebankChains, ChainId> = {
    eth: ChainId.Mainnet,
    boba: ChainId.Boba,
    arb: ChainId.Arbitrum,
    bsc: ChainId.BSC,
    avax: ChainId.Avalanche,
    celo: ChainId.Celo,
    xdai: ChainId.xDai,
    astar: ChainId.Astar,
    cfx: ChainId.Conflux,
    hmy: ChainId.Harmony,
    movr: ChainId.Moonriver,
    mobm: ChainId.Moonbeam,
    cro: ChainId.Cronos,
    btt: ChainId.BitTorrent,
    aurora: ChainId.Aurora,
    ftm: ChainId.Fantom,
    klay: ChainId.Klaytn,
    matic: ChainId.Matic,
    nova: ChainId.Arbitrum_Nova,
    op: ChainId.Optimism,
    pls: ChainId.Pulse,
}
