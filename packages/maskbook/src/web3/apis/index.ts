import type { GasPrice } from '../../plugins/Wallet/types'
import * as gasnow from './gasnow'
import * as gasstation from './gasstation'
import { ChainId, GasPriceProviderType } from '../types'
import { unreachable } from '../../utils/utils'
import { getGasPrice } from '../../extension/background-script/EthereumService'

export async function getGasPrices(provider: GasPriceProviderType, chainId: ChainId): Promise<GasPrice[]> {
    switch (provider) {
        case GasPriceProviderType.Default:
            return [
                {
                    title: 'Standard',
                    wait: 15,
                    gasPrice: gasnow.gweiToGwei((await getGasPrice(chainId)) || '0'),
                },
            ]
        case GasPriceProviderType.GasNow:
            return gasnow.getGasPrice()
        case GasPriceProviderType.GasStation:
            return gasstation.getGasPrice()
        default:
            unreachable(provider)
    }
}
