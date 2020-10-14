import type { ERC20TokenRecord } from '../Wallet/database/types'
import type { EthereumTokenType, EthereumNetwork } from '../../web3/types'

export interface LotteryJSONPayload {
    contract_version: number
    contract_address: string
    lyid: string
    password: string
    sender: {
        address: string
        name: string
        message: string
    }
    if_draw_at_time: boolean
    draw_at_time: number
    draw_at_number: number
    total_winner: number
    total_token: string
    prize_class: (string | number)[][]
    creation_time: number
    duration: number
    network?: EthereumNetwork
    token_type: EthereumTokenType
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}
export interface LotteryRecord {
    /** Internal ID */
    id: string
    /** The red packet ID */
    lyid: string
    /** From url */
    from: string
    /** The JSON payload */
    payload: LotteryJSONPayload
}

export interface LotteryRecordInDatabase extends LotteryRecord {
    type: 'lottery'
}

export enum LotteryStatus {
    participated = 'participated',
    expired = 'expired',
    drew = 'drew',
    refunded = 'refunded',
    won = 'won',
    notWon = 'notWon',
}
//#endregion
