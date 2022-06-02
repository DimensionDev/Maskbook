import BigNumber from 'bignumber.js'
import { toHex } from 'web3-utils'
import { GasOptionType, isLessThan } from '@masknet/web3-shared-base'
import { addGasMargin, chainResolver, formatGweiToWei, formatWeiToGwei } from '@masknet/web3-shared-evm'
import type { Context, Translator } from '../types'
import { Web3StateSettings } from '../../../settings'
import { isReadOnlyMethod } from '../connection'

export class Base implements Translator {
    async encode(context: Context) {
        const config = context.config
        if (!config || isReadOnlyMethod(context.method)) return

        // #region polyfill transaction config
        try {
            // add gas margin
            if (config.gas) {
                config.gas = toHex(BigNumber.max(toHex(addGasMargin(config.gas as string).toFixed()), 21000).toFixed())
            }

            // add gas price
            const hub = await Web3StateSettings.value.Hub?.getHub?.({
                chainId: context.chainId,
            })
            const options = await hub?.getGasOptions?.(context.chainId)
            const { [GasOptionType.SLOW]: slowOption, [GasOptionType.NORMAL]: normalOption } = options ?? {}

            if (chainResolver.isSupport(context.chainId, 'EIP1559')) {
                delete config.gasPrice

                if (
                    slowOption?.suggestedMaxFeePerGas &&
                    normalOption &&
                    isLessThan(
                        config.maxFeePerGas ? formatWeiToGwei(config.maxFeePerGas as string) : 0,
                        slowOption.suggestedMaxPriorityFeePerGas,
                    )
                ) {
                    config.maxFeePerGas = toHex(formatGweiToWei(normalOption.suggestedMaxFeePerGas).toFixed(0))
                    config.maxPriorityFeePerGas = toHex(
                        formatGweiToWei(normalOption.suggestedMaxPriorityFeePerGas).toFixed(0),
                    )
                }
            } else {
                delete config.maxFeePerGas
                delete config.maxPriorityFeePerGas

                if (
                    slowOption &&
                    normalOption &&
                    isLessThan((config.gasPrice as string) ?? 0, slowOption.suggestedMaxFeePerGas)
                ) {
                    config.gasPrice = toHex(normalOption.suggestedMaxFeePerGas)
                }
            }
        } catch (err) {
            console.error(err)
        }
        context.config = config
        // #endregion
    }

    async decode(context: Context) {}
}
