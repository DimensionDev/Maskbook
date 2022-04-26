import BigNumber from 'bignumber.js'
import { toHex } from 'web3-utils'
import { addGasMargin, chainResolver } from '@masknet/web3-shared-evm'
import type { Context, Translator } from '../types'

export class Base implements Translator {
    encode(context: Context) {
        const config = context.config
        if (!config) return

        // #region polyfill transaction config
        {
            // add gas margin
            if (config.gas)
                config.gas = BigNumber.max(toHex(addGasMargin(config.gas as string).toFixed()), 21000).toFixed()

            // fix gas price
            if (chainResolver.isSupport(context.chainId, 'EIP1559')) {
                delete config.gasPrice
            } else {
                delete config.maxFeePerGas
                delete config.maxPriorityFeePerGas
            }

            context.config = config
        }
        // #endregion
    }

    decode(context: Context) {}
}
