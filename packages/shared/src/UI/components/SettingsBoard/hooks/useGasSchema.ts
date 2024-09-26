import { useMemo } from 'react'
import { z as zod } from 'zod'
import { useSharedTrans } from '@masknet/shared'
import { type ChainId, formatGweiToWei, type GasOption, type Transaction } from '@masknet/web3-shared-evm'
import {
    type GasOptionType,
    isGreaterThanOrEqualTo,
    isLessThan,
    isLessThanOrEqualTo,
    isPositive,
    multipliedBy,
} from '@masknet/web3-shared-base'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export function useGasSchema(
    chainId: ChainId,
    transaction: Transaction | undefined,
    gasOptions: Record<GasOptionType, GasOption> | undefined,
) {
    const { _ } = useLingui()
    const t = useSharedTrans()

    return useMemo(() => {
        return zod
            .object({
                gasLimit: zod
                    .string()
                    .min(1, _(msg`Enter a gas limit`))
                    .refine(
                        (gasLimit) => isGreaterThanOrEqualTo(gasLimit, transaction?.gas ?? 21000),
                        _(msg`Gas limit too low will cause the transaction to fail.`),
                    ),
                gasPrice: zod
                    .string()
                    .min(1, _(msg`Enter a gas price`))
                    .refine(isPositive, _(msg`Gas price must be greater than 0 Gwei.`))
                    .refine(
                        (value) =>
                            isGreaterThanOrEqualTo(
                                formatGweiToWei(value),
                                gasOptions?.slow?.suggestedMaxFeePerGas ?? 0,
                            ),
                        _(msg`Gas price is too low for network conditions.`),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                formatGweiToWei(value),
                                multipliedBy(gasOptions?.fast?.suggestedMaxFeePerGas ?? 0, HIGH_FEE_WARNING_MULTIPLIER),
                            ),
                        _(msg`Gas price is higher than necessary. You may pay more than needed.`),
                    ),
                maxPriorityFeePerGas: zod
                    .string()
                    .min(1, _(msg`Enter a max priority fee`))
                    .refine(isPositive, _(msg`Max priority fee must be greater than 0 Gwei.`))
                    .refine(
                        (value) =>
                            isGreaterThanOrEqualTo(
                                formatGweiToWei(value),
                                gasOptions?.slow?.suggestedMaxPriorityFeePerGas ?? 0,
                            ),
                        _(msg`Max priority fee is too low for network conditions.`),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                formatGweiToWei(value),
                                multipliedBy(
                                    gasOptions?.fast?.suggestedMaxPriorityFeePerGas ?? 0,
                                    HIGH_FEE_WARNING_MULTIPLIER,
                                ),
                            ),
                        _(msg`Max priority fee is higher than necessary. You may pay more than needed.`),
                    ),
                maxFeePerGas: zod
                    .string()
                    .min(1, _(msg`Enter a max fee`))
                    .refine(
                        (value) =>
                            isGreaterThanOrEqualTo(
                                formatGweiToWei(value),
                                gasOptions?.slow?.suggestedMaxFeePerGas ?? 0,
                            ),
                        _(msg`Max fee is too low for network conditions.`),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                formatGweiToWei(value),
                                multipliedBy(gasOptions?.fast?.suggestedMaxFeePerGas ?? 0, HIGH_FEE_WARNING_MULTIPLIER),
                            ),
                        _(msg`Max fee is higher than necessary.`),
                    ),
            })
            .refine((data) => isLessThanOrEqualTo(data.maxPriorityFeePerGas, data.maxFeePerGas), {
                message: _(msg`Max fee cannot be lower than max priority fee.`),
                path: ['maxFeePerGas'],
            })
    }, [t, transaction?.gas, gasOptions])
}
