import type { CurrencyType } from '@masknet/web3-shared-base'

export namespace FiatCurrencyRateBaseAPI {
    export type Result = {
        rates: Record<string, number>
    }

    export interface Provider {
        getRate(type?: CurrencyType): Promise<number>
    }
}
