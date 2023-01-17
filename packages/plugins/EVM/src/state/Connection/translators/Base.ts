import { BigNumber } from 'bignumber.js'
import { toHex } from 'web3-utils'
import { GasOptionType, isLessThan, toFixed } from '@masknet/web3-shared-base'
import {
    addGasMargin,
    ChainId,
    chainResolver,
    formatWeiToGwei,
    PayloadEditor,
    Translator,
    ConnectionContext,
} from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings/index.js'

export class Base implements Translator<ConnectionContext> {
    async encode(context: ConnectionContext) {
        const config = context.config
        if (!config || PayloadEditor.fromPayload(context.request).readonly) return

        // #region polyfill transaction config
        try {
            // add gas margin
            if (config.gas) {
                config.gas = toHex(
                    BigNumber.max(
                        toHex(addGasMargin(config.gas as string).toFixed()),
                        context.chainId === ChainId.Optimism ? 25000 : 21000,
                    ).toFixed(),
                )
            }

            // add gas price
            const hub = Web3StateSettings.value.Hub?.getHub?.({
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
                        config.maxPriorityFeePerGas ? formatWeiToGwei(config.maxPriorityFeePerGas as string) : 0,
                        slowOption.suggestedMaxPriorityFeePerGas,
                    )
                ) {
                    config.maxFeePerGas = toHex(toFixed(normalOption.suggestedMaxFeePerGas, 0))
                    config.maxPriorityFeePerGas = toHex(toFixed(normalOption.suggestedMaxPriorityFeePerGas, 0))
                }
            } else {
                delete config.maxFeePerGas
                delete config.maxPriorityFeePerGas

                if (slowOption && normalOption && isLessThan(config.gasPrice ?? 0, slowOption.suggestedMaxFeePerGas)) {
                    config.gasPrice = toHex(toFixed(normalOption.suggestedMaxFeePerGas, 0))
                }
            }
        } catch (err) {
            console.error(err)
        }

        const overrideMaxFeePerGas = context.requestOptions?.overrides?.maxFeePerGas
        const overrideMaxPriorityFeePerGas = context.requestOptions?.overrides?.maxPriorityFeePerGas
        const overrideGasPrice = context.requestOptions?.overrides?.gasPrice

        context.config = {
            ...config,
            maxFeePerGas: overrideMaxFeePerGas ? toHex(overrideMaxFeePerGas) : config.maxFeePerGas,
            maxPriorityFeePerGas: overrideMaxPriorityFeePerGas
                ? toHex(overrideMaxPriorityFeePerGas)
                : config.maxPriorityFeePerGas,
            gasPrice: overrideGasPrice ? toHex(overrideGasPrice) : config.gasPrice,
        }
        // #endregion
    }

    async decode(context: ConnectionContext) {}
}
