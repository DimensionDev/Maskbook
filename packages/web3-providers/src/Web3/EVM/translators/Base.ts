import { BigNumber } from 'bignumber.js'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { GasOptionType, isLessThan, toFixed } from '@masknet/web3-shared-base'
import { ChainId, formatWeiToGwei, PayloadEditor, ProviderType, type Translator } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { EVMHub } from '../apis/HubAPI.js'
import { EVMChainResolver } from '../apis/ResolverAPI.js'

export abstract class BaseTranslator implements Translator<ConnectionContext> {
    async encode(context: ConnectionContext) {
        const config = context.config
        if (!config || PayloadEditor.fromPayload(context.request).readonly) return

        // #region polyfill transaction config
        try {
            // add gas margin
            if (config.gas) {
                config.gas = web3_utils.toHex(
                    BigNumber.max(
                        web3_utils.toHex(config.gas),
                        context.chainId === ChainId.Optimism ? 25000 : 21000,
                    ).toFixed(),
                )
            }

            // add gas price
            const options = await EVMHub.getGasOptions(context.chainId, {
                chainId: context.chainId,
            })
            const { [GasOptionType.SLOW]: slowOption, [GasOptionType.NORMAL]: normalOption } = options ?? {}

            // TODO: this field seems like not documented anywhere. should we just stop changing gasPrice?
            const legacyTransactionUsed = config.type === '0x0'

            if (!legacyTransactionUsed && EVMChainResolver.isFeatureSupported(context.chainId, 'EIP1559')) {
                delete config.gasPrice

                if (
                    slowOption?.suggestedMaxFeePerGas &&
                    normalOption &&
                    isLessThan(
                        config.maxPriorityFeePerGas ? formatWeiToGwei(config.maxPriorityFeePerGas) : 0,
                        slowOption.suggestedMaxPriorityFeePerGas,
                    )
                ) {
                    config.maxFeePerGas = web3_utils.toHex(toFixed(normalOption.suggestedMaxFeePerGas, 0))
                    config.maxPriorityFeePerGas = web3_utils.toHex(
                        toFixed(normalOption.suggestedMaxPriorityFeePerGas, 0),
                    )
                }
            } else {
                delete config.maxFeePerGas
                delete config.maxPriorityFeePerGas

                if (slowOption && normalOption && isLessThan(config.gasPrice ?? 0, slowOption.suggestedMaxFeePerGas)) {
                    config.gasPrice = web3_utils.toHex(toFixed(normalOption.suggestedMaxFeePerGas, 0))
                }
            }
        } catch (err) {
            console.error(err)
        }

        const overrideMaxFeePerGas = context.requestOptions.overrides?.maxFeePerGas
        const overrideMaxPriorityFeePerGas = context.requestOptions.overrides?.maxPriorityFeePerGas
        const overrideGasPrice = context.requestOptions.overrides?.gasPrice

        context.config = {
            ...config,
            maxFeePerGas: overrideMaxFeePerGas ? web3_utils.toHex(overrideMaxFeePerGas) : config.maxFeePerGas,
            maxPriorityFeePerGas:
                overrideMaxPriorityFeePerGas ?
                    web3_utils.toHex(overrideMaxPriorityFeePerGas)
                :   config.maxPriorityFeePerGas,
            gasPrice: overrideGasPrice ? web3_utils.toHex(overrideGasPrice) : config.gasPrice,
        }
        // #endregion
    }

    async decode(context: ConnectionContext) {}
}
export class DefaultTranslator extends BaseTranslator {}
