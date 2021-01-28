import type { GasPrice } from '../../plugins/Wallet/types'
import * as gasnow from './gasnow'
import * as gasstation from './gasstation'
import { GasPriceProviderType } from '../types'
import { unreachable } from '../../utils/utils'

export function getGasPrices(provider: GasPriceProviderType): GasPrice[] {
    switch (provider) {
        case GasPriceProviderType.GasNow:
            return gasnow.getGasPrice()
        case GasPriceProviderType.GasStation:
            return gasstation.getGasPrice()
        default:
            unreachable(provider)
    }
}
