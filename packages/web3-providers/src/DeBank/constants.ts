import { ChainId } from '@masknet/web3-shared-evm'
import type { DebankChains } from './types.js'

export const DEBANK_OPEN_API = 'https://debank-proxy.r2d2.to'

/**
 * Collect from https://docs.cloud.debank.com/en/readme/api-pro-reference/chain#returns-1
 * but they might not list all, for example, missing 369:pls
 */
export const DEBANK_CHAIN_TO_CHAIN_ID_MAP: Record<DebankChains, ChainId | number> = {
    arb: ChainId.Arbitrum,
    astar: ChainId.Astar,
    aurora: ChainId.Aurora,
    avax: ChainId.Avalanche,
    boba: ChainId.Boba,
    brise: 32520,
    bsc: ChainId.BSC,
    btt: ChainId.BitTorrent,
    canto: 7700,
    celo: ChainId.Celo,
    cfx: ChainId.Conflux,
    cro: ChainId.Cronos,
    dfk: 53935,
    doge: 2000,
    eth: ChainId.Mainnet,
    evmos: 9001,
    ftm: ChainId.Fantom,
    fuse: 122,
    heco: 128,
    hmy: ChainId.Harmony,
    iotx: 4689,
    kava: 2222,
    kcc: 321,
    klay: ChainId.Klaytn,
    mada: 2001,
    matic: ChainId.Matic,
    metis: 1088,
    mobm: ChainId.Moonbeam,
    movr: ChainId.Moonriver,
    nova: ChainId.Arbitrum_Nova,
    okt: 66,
    op: ChainId.Optimism,
    palm: 11297108109,
    pls: ChainId.Pulse,
    rsk: 30,
    sbch: 10000,
    sdn: 336,
    sgb: 19,
    step: 1234,
    swm: 73772,
    tlos: 40,
    wan: 888,
    xdai: ChainId.xDai,
}

/**
 * Collect from https://docs.cloud.debank.com/en/readme/api-pro-reference/chain#returns-1
 * but they might not list all, for example, missing 369:pls
 */
export const CHIAN_ID_TO_DEBANK_CHAIN_MAP: Record<number, DebankChains> = {
    1: 'eth',
    10: 'op',
    19: 'sgb',
    25: 'cro',
    30: 'rsk',
    40: 'tlos',
    56: 'bsc',
    66: 'okt',
    100: 'xdai',
    122: 'fuse',
    128: 'heco',
    137: 'matic',
    199: 'btt',
    250: 'ftm',
    288: 'boba',
    321: 'kcc',
    336: 'sdn',
    369: 'pls',
    592: 'astar',
    888: 'wan',
    1030: 'cfx',
    1088: 'metis',
    1234: 'step',
    1284: 'mobm',
    1285: 'movr',
    2000: 'doge',
    2001: 'mada',
    2222: 'kava',
    4689: 'iotx',
    7700: 'canto',
    8217: 'klay',
    9001: 'evmos',
    10000: 'sbch',
    32520: 'brise',
    42161: 'arb',
    42170: 'nova',
    42220: 'celo',
    43114: 'avax',
    53935: 'dfk',
    73772: 'swm',
    1313161554: 'aurora',
    1666600000: 'hmy',
    11297108109: 'palm',
}
