import BigNumber from 'bignumber.js'
import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { LotteryMetaKey } from './constants'
import type { LotteryJSONPayload } from './types'
import schema from './schema.json'
export const LotteryMetadataReader = createTypedMessageMetadataReader<LotteryJSONPayload>(LotteryMetaKey, schema)
export const renderWithLotteryMetadata = createRenderWithMetadata(LotteryMetadataReader)

export function createPrizeClass(
    prize_class: { token_number: string | number; winner_number: number }[],
): (string | number)[][] {
    var pc: (string | number)[][] = []
    for (var i: number = 0; i < prize_class.length; i += 1) {
        pc.push([prize_class[i].token_number, prize_class[i].winner_number])
    }
    return pc
}

export function getTotalToken(prize_class: (string | number)[][]): string {
    var total_token = new BigNumber(0)
    prize_class.forEach(
        (pc) => (total_token = BigNumber.sum(total_token, new BigNumber(pc[0]).multipliedBy(new BigNumber(pc[1])))),
    )
    return total_token.toFixed()
}

export function getTotalWinner(prize_class: (string | number)[][]): number {
    var total_winner: number = 0
    prize_class.forEach((pc) => (total_winner += Number(pc[1])))
    return total_winner
}
