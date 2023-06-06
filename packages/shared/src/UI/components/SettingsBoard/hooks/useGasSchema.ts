import { useMemo } from 'react'
import { z as zod } from 'zod'
import { useSharedI18N } from '@masknet/shared'
import { type ChainId, formatGweiToWei, type GasOption, type Transaction } from '@masknet/web3-shared-evm'
import {
    type GasOptionType,
    isGreaterThanOrEqualTo,
    isLessThan,
    isLessThanOrEqualTo,
    isPositive,
    multipliedBy,
} from '@masknet/web3-shared-base'

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export function useGasSchema(
    chainId: ChainId,
    transaction: Transaction | undefined,
    gasOptions: Record<GasOptionType, GasOption> | undefined,
) {
    const t = useSharedI18N()

    return useMemo(() => {
        return zod
            .object({
                gasLimit: zod
                    .string()
                    .min(1, t.gas_settings_error_gas_limit_absence())
                    .refine(
                        (gasLimit) => isGreaterThanOrEqualTo(gasLimit, transaction?.gas ?? 21000),
                        t.gas_settings_error_gas_limit_too_low(),
                    ),
                gasPrice: zod
                    .string()
                    .min(1, t.gas_settings_error_gas_price_absence())
                    .refine(isPositive, t.gas_settings_error_gas_price_positive())
                    .refine(
                        (value) =>
                            isGreaterThanOrEqualTo(
                                formatGweiToWei(value),
                                gasOptions?.slow.suggestedMaxFeePerGas ?? 0,
                            ),
                        t.gas_settings_error_gas_price_too_low(),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                formatGweiToWei(value),
                                multipliedBy(gasOptions?.fast.suggestedMaxFeePerGas ?? 0, HIGH_FEE_WARNING_MULTIPLIER),
                            ),
                        t.gas_settings_error_gas_price_too_high(),
                    ),
                maxPriorityFeePerGas: zod
                    .string()
                    .min(1, t.gas_settings_error_max_priority_fee_absence())
                    .refine(isPositive, t.gas_settings_error_max_priority_gas_fee_positive())
                    .refine(
                        (value) =>
                            isGreaterThanOrEqualTo(
                                formatGweiToWei(value),
                                gasOptions?.slow.suggestedMaxPriorityFeePerGas ?? 0,
                            ),
                        t.gas_settings_error_max_priority_gas_fee_too_low(),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                formatGweiToWei(value),
                                multipliedBy(
                                    gasOptions?.fast.suggestedMaxPriorityFeePerGas ?? 0,
                                    HIGH_FEE_WARNING_MULTIPLIER,
                                ),
                            ),
                        t.gas_settings_error_max_priority_gas_fee_too_high(),
                    ),
                maxFeePerGas: zod
                    .string()
                    .min(1, t.gas_settings_error_max_fee_absence())
                    .refine(
                        (value) =>
                            isGreaterThanOrEqualTo(
                                formatGweiToWei(value),
                                gasOptions?.slow.suggestedMaxFeePerGas ?? 0,
                            ),
                        t.gas_settings_error_max_fee_too_low(),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                formatGweiToWei(value),
                                multipliedBy(gasOptions?.fast.suggestedMaxFeePerGas ?? 0, HIGH_FEE_WARNING_MULTIPLIER),
                            ),
                        t.gas_settings_error_max_fee_too_high(),
                    ),
            })
            .refine((data) => isLessThanOrEqualTo(data.maxPriorityFeePerGas, data.maxFeePerGas), {
                message: t.gas_settings_error_max_priority_gas_fee_imbalance(),
                path: ['maxFeePerGas'],
            })
    }, [t, transaction?.gas, gasOptions])
}
