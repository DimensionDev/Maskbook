import type { GasPrice } from '../../plugins/Wallet/types'
import * as gasnow from './gasnow'
import * as gasstation from './gasstation'
import { GasPriceProviderType } from '../types'
import { unreachable } from '../../utils/utils'

export async function getGasPrices(provider: GasPriceProviderType): Promise<GasPrice[]> {
    switch (provider) {
        case GasPriceProviderType.GasNow: {
            return await gasnow.getGasPrice()
        }
        case GasPriceProviderType.GasStation: {
            return await gasstation.getGasPrice()
        }
        default: {
            return unreachable(provider)
        }
    }
}
