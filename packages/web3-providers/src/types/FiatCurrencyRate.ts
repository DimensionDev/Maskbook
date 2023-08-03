import type { FiatCurrencyType } from '@masknet/web3-shared-base'

export namespace FiatCurrencyRateBaseAPI {
    export type Result = {
        rates: Record<FiatCurrencyType, number>
    }

    export interface Provider {
        getRate(type?: FiatCurrencyType): Promise<number>
    }
}
