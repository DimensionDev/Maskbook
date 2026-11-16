export const NON_FUNGIBLE_TOKEN_API_URL = 'https://api.rabby.io/v1/user/nft_authorized_list'
export const FUNGIBLE_TOKEN_API_URL = 'https://api.rabby.io/v1/user/token_authorized_list'

/**
 * Chain slugs accepted by api.rabby.io as `chain_id`. api.rabby.io identifies
 * chains by slug (inherited from its original upstream) rather than numeric id.
 */
export type RabbyChain =
    | 'arb'
    | 'astar'
    | 'aurora'
    | 'avax'
    | 'base'
    | 'boba'
    | 'sei'
    | 'brise'
    | 'bsc'
    | 'btt'
    | 'canto'
    | 'celo'
    | 'cfx'
    | 'cro'
    | 'dfk'
    | 'doge'
    | 'eth'
    | 'evmos'
    | 'ftm'
    | 'fuse'
    | 'heco'
    | 'hmy'
    | 'hood'
    | 'iotx'
    | 'kava'
    | 'kcc'
    | 'klay'
    | 'mada'
    | 'matic'
    | 'metis'
    | 'mobm'
    | 'movr'
    | 'nova'
    | 'okt'
    | 'op'
    | 'palm'
    | 'pls'
    | 'rsk'
    | 'sbch'
    | 'scrl'
    | 'sdn'
    | 'sgb'
    | 'step'
    | 'swm'
    | 'tlos'
    | 'wan'
    | 'xdai'
    | 'xlayer'

/**
 * Originally collected from the chain list reference of the original upstream
 * provider, which might not list all chains (for example, missing 369: pls).
 */
export const CHAIN_ID_TO_RABBY_CHAIN_MAP: { [key: number]: RabbyChain } = {
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
    4663: 'hood',
    4689: 'iotx',
    7700: 'canto',
    8217: 'klay',
    8453: 'base',
    9001: 'evmos',
    10_000: 'sbch',
    32_520: 'brise',
    42_161: 'arb',
    42_170: 'nova',
    42_220: 'celo',
    43_114: 'avax',
    53_935: 'dfk',
    534_352: 'scrl',
    73_772: 'swm',
    1_313_161_554: 'aurora',
    1_666_600_000: 'hmy',
    11_297_108_109: 'palm',
}

export function getRabbyChain(chainId: number) {
    const chain = CHAIN_ID_TO_RABBY_CHAIN_MAP[chainId]
    if (process.env.NODE_ENV === 'development' && !chain) {
        console.warn('[Rabby] no matching chain slug', chainId)
    }
    return chain
}
