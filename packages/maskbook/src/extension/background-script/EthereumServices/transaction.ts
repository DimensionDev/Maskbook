import { pickBy } from 'lodash-es'
import type { TransactionConfig } from 'web3-core'
import { toHex } from 'web3-utils'

import { addGasMargin } from '../../../web3/helpers'
import { getNonce } from './nonce'
import { estimateGas, getGasPrice } from './network'
import { currentSelectedWalletAddressSettings } from '../../../plugins/Wallet/settings'

/**
 * Compose a common purpose transaction payload
 * @param from
 * @returns
 */
export async function composeTransaction(config: TransactionConfig): Promise<TransactionConfig> {
    const { from = currentSelectedWalletAddressSettings.value, to, data, value } = config
    const [nonce, gas, gasPrice] = await Promise.all([
        config.nonce ?? getNonce(from as string),
        config.gas ??
            estimateGas({
                from,
                to,
                data,
                value: value ? toHex(value) : undefined,
            }),
        config.gasPrice ?? getGasPrice(),
    ])

    return pickBy({
        from,
        value,
        nonce,
        gas: addGasMargin(gas).toFixed(),
        gasPrice,
    })
}
