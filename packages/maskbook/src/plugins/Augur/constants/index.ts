import { ChainId } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'

export const AUGUR_PLUGIN_ID = 'com.augur'
export const AUGUR_CHAIN_ID = ChainId.Matic
export const PLUGIN_NAME = 'Augur'

export const BASE_URL = 'https://bafybeieqpwd47pmwcmidysq3demjbzd6kkeg6asxcyudk2tbpwdjxxvqkq.ipfs.dweb.link'
export const NO_CONTEST_OUTCOME_ID: number = 0

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
export const OUTCOME_PRICE_PRECISION = 2
export const MINIMUM_BALANCE = 1 / 10 ** BALANCE_DECIMALS
export const DUST_POSITION_AMOUNT_ON_CHAIN = new BigNumber('0.0001').times(10 ** 18)
export const MINIMUM_INITIAL_LP = 100
