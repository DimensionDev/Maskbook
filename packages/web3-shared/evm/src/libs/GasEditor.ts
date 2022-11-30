import { toHex } from 'web3-utils'
import { GasOptionType, multipliedBy, toFixed } from '@masknet/web3-shared-base'
import { formatWeiToEther, chainResolver } from '../helpers/index.js'
import type {
    ChainId,
    EIP1559GasConfig,
    GasConfig,
    GasOption,
    PriorEIP1559GasConfig,
    Transaction,
} from '../types/index.js'

export class GasEditor {
    constructor(private chainId: ChainId, private config: Partial<GasConfig>) {}

    private get isEIP1559() {
        return chainResolver.isSupport(this.chainId, 'EIP1559')
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
        return (this.EIP1559GasOptionConfig.maxFeePerGas || this.priorEIP1559GasOptionConfig.gasPrice) as string
    }

    getGasConfig(fallback?: Partial<GasConfig>): GasConfig {
        if (this.isEIP1559) {
            const config = fallback as EIP1559GasConfig | undefined
            return {
                gasPrice: undefined,
                maxFeePerGas: toHex(this.EIP1559GasOptionConfig.maxFeePerGas) || toHex(config?.maxFeePerGas || '0'),
                maxPriorityFeePerGas:
                    toHex(this.EIP1559GasOptionConfig.maxPriorityFeePerGas) ||
                    toHex(config?.maxPriorityFeePerGas || '1'),
            }
        }

        const priorConfig = fallback as PriorEIP1559GasConfig | undefined

        return {
            gasPrice: toHex(this.priorEIP1559GasOptionConfig.gasPrice) || toHex(priorConfig?.gasPrice || '0'),
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
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
            gas: transaction?.gas as number | undefined,
            gasPrice: transaction?.gasPrice as string | undefined,
            maxFeePerGas: transaction?.maxFeePerGas as string | undefined,
            maxPriorityFeePerGas: transaction?.maxPriorityFeePerGas as string | undefined,
        })
    }

    static fromGasOption(chainId: ChainId, gasOption?: GasOption) {
        return new GasEditor(chainId, {
            gasPrice: toFixed(gasOption?.suggestedMaxFeePerGas ?? 0, 0),
            maxFeePerGas: toFixed(gasOption?.suggestedMaxFeePerGas ?? 0, 0),
            maxPriorityFeePerGas: toFixed(gasOption?.suggestedMaxPriorityFeePerGas ?? 0, 0),
        })
    }

    static fromGasOptions(
        chainId: ChainId,
        gasOptions?: Record<GasOptionType, GasOption>,
        gasOptionType = GasOptionType.NORMAL,
    ) {
        return new GasEditor(chainId, {
            gasPrice: toFixed(gasOptions?.[gasOptionType]?.suggestedMaxFeePerGas ?? 0, 0),
            maxFeePerGas: toFixed(gasOptions?.[gasOptionType]?.suggestedMaxFeePerGas ?? 0, 0),
            maxPriorityFeePerGas: toFixed(gasOptions?.[gasOptionType]?.suggestedMaxPriorityFeePerGas ?? 0, 0),
        })
    }
}
