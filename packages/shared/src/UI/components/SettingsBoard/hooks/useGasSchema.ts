import { useMemo } from 'react'
import { useSharedI18N } from '@masknet/shared'
import type { ChainId, GasOption, Transaction } from '@masknet/web3-shared-evm'
import {
    GasOptionType,
    isGreaterThanOrEqualTo,
    isLessThan,
    isLessThanOrEqualTo,
    isPositive,
    multipliedBy,
    NetworkPluginID,
} from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { z as zod } from 'zod'

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export function useGasSchema(chainId: ChainId, transaction: Transaction, gasOptions: Record<GasOptionType, GasOption>) {
    const t = useSharedI18N()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const isEIP1559 = Others?.chainResolver.isSupport(chainId, 'EIP1559')
    return useMemo(() => {
        return zod
            .object({
                gasLimit: zod
                    .string()
                    .min(1, t.gas_settings_error_gas_limit_absence())
                    .refine(
                        (gasLimit) => isGreaterThanOrEqualTo(gasLimit, transaction.gas as string),
                        t.gas_settings_error_min_gas_limit_tips(),
                    ),
                gasPrice: zod
                    .string()
                    .min(1, t.gas_settings_error_gas_price_absence())
                    .refine(isPositive, t.gas_settings_error_gas_price_positive())
                    .refine(
                        (value) => isGreaterThanOrEqualTo(value, gasOptions.slow?.suggestedMaxFeePerGas ?? 0),
                        t.gas_settings_error_gas_price_too_low(),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                value,
                                multipliedBy(gasOptions.fast?.suggestedMaxFeePerGas ?? 0, HIGH_FEE_WARNING_MULTIPLIER),
                            ),
                        t.gas_settings_error_gas_price_too_high(),
                    ),
                maxPriorityFeePerGas: zod
                    .string()
                    .min(1, t.gas_settings_error_max_priority_fee_absence())
                    .refine(isPositive, t.gas_settings_error_max_priority_gas_fee_positive())
                    .refine(
                        (value) => isGreaterThanOrEqualTo(value, gasOptions.slow?.suggestedMaxPriorityFeePerGas ?? 0),
                        t.gas_settings_error_max_priority_gas_fee_too_low(),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                value,
                                multipliedBy(
                                    gasOptions.fast?.suggestedMaxPriorityFeePerGas ?? 0,
                                    HIGH_FEE_WARNING_MULTIPLIER,
                                ),
                            ),
                        t.gas_settings_error_max_priority_gas_fee_too_high(),
                    ),
                maxFeePerGas: zod
                    .string()
                    .min(1, t.gas_settings_error_max_fee_absence())
                    .refine(
                        (value) => isGreaterThanOrEqualTo(value, gasOptions.slow?.suggestedMaxFeePerGas ?? 0),
                        t.gas_settings_error_max_fee_too_low(),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                value,
                                multipliedBy(gasOptions.fast?.suggestedMaxFeePerGas ?? 0, HIGH_FEE_WARNING_MULTIPLIER),
                            ),
                        t.gas_settings_error_max_fee_too_high(),
                    ),
            })
            .refine((data) => isLessThanOrEqualTo(data.maxPriorityFeePerGas, data.maxFeePerGas), {
                message: t.gas_settings_error_max_priority_gas_fee_imbalance(),
                path: ['maxFeePerGas'],
            })
    }, [t, isEIP1559, transaction.gas, gasOptions, Others])
}
