import { produce } from 'immer'
import { type SimpleHash } from '../types/SimpleHash.js'
import { maxBy, uniqBy } from 'lodash-es'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { TrendingAPI } from '../entry-types.js'
import { BigNumber } from 'bignumber.js'
import { leftShift } from '@masknet/web3-shared-base'

type HistoricalPriceMap = Record<string, TrendingAPI.Stat[]>
type PaymentTokenMap = Record<string, SimpleHash.PaymentToken>

class HistoricalPriceState {
    private _priceState: HistoricalPriceMap = {}
    private _paymentTokenState: PaymentTokenMap = {}
    private _allLoadedIdListState: string[] = []

    get priceState() {
        return this._priceState
    }

    public getPriceStats(id: string, range?: number) {
        const allStats = this._priceState[id]

        return range ? allStats.filter((x) => x[0] > range) : allStats
    }

    public getHighestPrice(id: string) {
        return this._priceState[id] ? maxBy(this._priceState[id], (x) => x[1])?.[1] : undefined
    }

    public isLoaded(id: string, fromTimeStamp?: number) {
        return (
            !!this._allLoadedIdListState.find((x) => x === id) ||
            (fromTimeStamp && !!this._priceState[id].find((x) => x[0] < fromTimeStamp))
        )
    }

    public updatePriceState(
        id: string,
        priceStats: SimpleHash.PriceStat[],
        paymentToken: SimpleHash.PaymentToken | undefined,
    ) {
        if (!paymentToken) return

        this._priceState = produce(this._priceState, (draft) => {
            if (!draft[id]) draft[id] = EMPTY_LIST
            priceStats.map((x) => [
                new Date(x.timestamp).getTime(),
                new BigNumber(leftShift(x.floor_price, paymentToken.decimals).toPrecision(4)).toNumber(),
            ])
            draft[id] = uniqBy(
                draft[id]
                    .concat(
                        priceStats.map((x) => [
                            new Date(x.timestamp).getTime(),
                            new BigNumber(leftShift(x.floor_price, paymentToken.decimals).toPrecision(4)).toNumber(),
                        ]),
                    )
                    .sort((a, b) => a[0] - b[0]),
                (x) => x[0],
            )
        })

        this._paymentTokenState = produce(this._paymentTokenState, (draft) => {
            draft[id] = paymentToken
        })
    }

    public updateAllLoadedIdListState(id: string) {
        this._allLoadedIdListState = produce(this._allLoadedIdListState, (draft) => draft.concat(id))
    }
}

export const historicalPriceState = new HistoricalPriceState()
