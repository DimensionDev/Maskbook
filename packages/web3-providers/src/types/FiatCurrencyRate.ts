import type { FiatCurrencyType } from '@masknet/web3-shared-base'

export namespace FiatCurrencyRateBaseAPI {
    export type Result = {
        rates: Record<FiatCurrencyType, number>
        code: number
    }

    export interface Provider {
        getRate(type?: FiatCurrencyType): Promise<number>
    }
}
