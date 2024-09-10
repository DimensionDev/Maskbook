import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { GasOptionType, isZero, multipliedBy, toFixed } from '@masknet/web3-shared-base'
import { formatWeiToEther } from '../helpers/formatter.js'
import type {
    ChainId,
    EIP1559GasConfig,
    GasConfig,
    GasOption,
    PriorEIP1559GasConfig,
    Transaction,
} from '../types/index.js'
import { CHAIN_DESCRIPTORS } from '../constants/descriptors.js'

export class GasEditor {
    constructor(
        private chainId: ChainId,
        private config: Partial<GasConfig>,
    ) {}

    private get isEIP1559() {
        return !!CHAIN_DESCRIPTORS.find((x) => x.chainId === this.chainId)?.features?.includes('EIP1559')
    }

    private get EIP1559GasOptionConfig() {
        return this.config as EIP1559GasConfig
    }

    private get priorEIP1559GasOptionConfig() {
        return this.config as PriorEIP1559GasConfig
    }

    getGasFee(gas: string | number) {
        return multipliedBy(this.getGasPrice(), gas)
    }

    getGasFeeInUSD(gas: string, price: string) {
        return formatWeiToEther(this.getGasFee(gas)).multipliedBy(price)
    }

    getGasPrice() {
        return this.EIP1559GasOptionConfig.maxFeePerGas || this.priorEIP1559GasOptionConfig.gasPrice || '0'
    }

    getGasConfig(fallback?: Partial<GasConfig>): GasConfig {
        if (this.isEIP1559) {
            const config = fallback as EIP1559GasConfig | undefined
            return {
                gasPrice: undefined,
                maxFeePerGas:
                    web3_utils.toHex(this.EIP1559GasOptionConfig.maxFeePerGas) ||
                    web3_utils.toHex(config?.maxFeePerGas || '0'),
                maxPriorityFeePerGas:
                    web3_utils.toHex(this.EIP1559GasOptionConfig.maxPriorityFeePerGas) ||
                    web3_utils.toHex(config?.maxPriorityFeePerGas || '1'),
                gasCurrency: this.EIP1559GasOptionConfig.gasCurrency || fallback?.gasCurrency,
                gas:
                    this.EIP1559GasOptionConfig.gas && !isZero(this.EIP1559GasOptionConfig.gas) ?
                        web3_utils.toHex(this.EIP1559GasOptionConfig.gas)
                    :   undefined,
                gasOptionType: this.config.gasOptionType ?? config?.gasOptionType,
            }
        }

        const priorConfig = fallback as PriorEIP1559GasConfig | undefined

        return {
            gasPrice:
                web3_utils.toHex(this.priorEIP1559GasOptionConfig.gasPrice) ||
                web3_utils.toHex(priorConfig?.gasPrice || '0'),
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
            gasOptionType: this.config.gasOptionType ?? priorConfig?.gasOptionType,
        }
    }

    static fromConfig(chainId: ChainId, gasConfig: Partial<GasConfig> = {}) {
        return new GasEditor(chainId, gasConfig)
    }

    static fromGasPrice(chainId: ChainId, gasPrice = '0') {
        return new GasEditor(chainId, {
            gasPrice,
            maxFeePerGas: gasPrice,
            maxPriorityFeePerGas: gasPrice,
        })
    }

    static fromTransaction(chainId: ChainId, transaction?: Transaction) {
        return new GasEditor(chainId, {
            gas: transaction?.gas,
            gasPrice: transaction?.gasPrice,
            maxFeePerGas: transaction?.maxFeePerGas,
            maxPriorityFeePerGas: transaction?.maxPriorityFeePerGas,
        })
    }

    static fromGasOption(chainId: ChainId, gasOption?: GasOption, gasOptionType?: GasOptionType) {
        return new GasEditor(chainId, {
            gasPrice: toFixed(gasOption?.suggestedMaxFeePerGas ?? 0, 0),
            maxFeePerGas: toFixed(gasOption?.suggestedMaxFeePerGas ?? 0, 0),
            maxPriorityFeePerGas: toFixed(gasOption?.suggestedMaxPriorityFeePerGas ?? 0, 0),
            gasOptionType,
        })
    }

    static fromGasOptions(
        chainId: ChainId,
        gasOptions?: Record<GasOptionType, GasOption> | null,
        gasOptionType = GasOptionType.NORMAL,
    ) {
        return new GasEditor(chainId, {
            gasPrice: toFixed(gasOptions?.[gasOptionType].suggestedMaxFeePerGas ?? 0, 0),
            maxFeePerGas: toFixed(gasOptions?.[gasOptionType].suggestedMaxFeePerGas ?? 0, 0),
            maxPriorityFeePerGas: toFixed(gasOptions?.[gasOptionType].suggestedMaxPriorityFeePerGas ?? 0, 0),
            gasOptionType,
        })
    }
}
