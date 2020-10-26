import { ChainId } from '../../web3/types'

export const LotteryMetaKey = 'com.maskbook.lottery:1'
export const LotteryPluginID = 'com.maskbook.lottery'

export const LOTTERY_CONSTANTS = {
    LUCKY_LOTTERY_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0x70a6499Abf77032f02e589558Fcbd9591A83e58D', //old-contract: '0xAE6F4b37c11834C5fbdcE158B5379f786b24662e',
        [ChainId.Kovan]: '',
    },
}

export const DEFAULT_PRIZE_TOKEN_NUMBER = 0.01
export const DEFAULT_DRAW_AT_TIME = 24 * 3600 //unit: second, default 24 hour
export const DEFAULT_DRAW_AT_NUMBER = 5 //5 people
export const DEFAULT_DURATION = 24 * 3600 // 1 day
export const MAX_DRAW_TIME = 24 * 3600 * 365 //1 year
export const MAX_DRAW_NUMBER = 100000 // 100k people
export const MAX_DURATION = 24 * 3600 * 365 //1 year
