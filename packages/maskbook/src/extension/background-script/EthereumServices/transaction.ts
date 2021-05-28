import { pickBy } from 'lodash-es'
import type { TransactionConfig } from 'web3-core'
import { toHex } from 'web3-utils'
import { addGasMargin } from '@dimensiondev/web3-shared'
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
    const from_ = from as string

    const nonce = config.nonce ?? (await getNonce(from_))
    const [gas, gasPrice] = await Promise.all([
        config.gas ??
            estimateGas({
                from: from_,
                to,
                data,
                nonce,
                value: value ? toHex(value) : undefined,
            }),
        config.gasPrice ?? getGasPrice(),
    ])

    return pickBy({
        from,
        to,
        data,
        nonce,
        value,
        gas: addGasMargin(gas).toFixed(),
        gasPrice,
    })
}
