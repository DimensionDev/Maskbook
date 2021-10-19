import { ChainId } from '@masknet/web3-shared'

export const AUGUR_PLUGIN_ID = 'com.augur'
export const AUGUR_CHAIN_ID = ChainId.Matic
export const PLUGIN_NAME = 'Augur'

export const BASE_URL = 'https://bafybeieqpwd47pmwcmidysq3demjbzd6kkeg6asxcyudk2tbpwdjxxvqkq.ipfs.dweb.link'
export const NO_CONTEST_OUTCOME_ID: number = 0
export const NAMING_TEAM = {
    HOME_TEAM: 'HOME_TEAM',
    AWAY_TEAM: 'AWAY_TEAM',
    FAV_TEAM: 'FAV_TEAM',
    UNDERDOG_TEAM: 'UNDERDOG_TEAM',
}
export const NAMING_LINE = {
    SPREAD_LINE: 'SPREAD_LINE',
    OVER_UNDER_LINE: 'OVER_UNDER_LINE',
}

export const MMA_MARKET_TYPE = {
    MONEY_LINE: 0,
    SPREAD: 1, // TODO: no spread markets for MMA when real market factory gets created
    OVER_UNDER: 1,
}

export const NO_CONTEST = 'No Contest'
export const NO_CONTEST_TIE = 'Tie/No Contest'
export const AWAY_TEAM_OUTCOME = 1
export const MARKET_DESCRIPTION_LIMIT = 210
export const FALLBACK_SWAP_FEE = 1.5
export const SWAP_FEE_DECIMALS = 18
export const SHARE_DECIMALS = 18
export const MIN_SELL_AMOUNT = 10 ** 14
export const BALANCE_DECIMALS = 4
export const DESCRIPTION_PRECISION = 2
export const MINIMUM_BALANCE = 1 / 10 ** BALANCE_DECIMALS
