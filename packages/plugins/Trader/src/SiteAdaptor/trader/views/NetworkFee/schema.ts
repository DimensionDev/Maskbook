import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { isGreaterThan, isLessThan } from '@masknet/web3-shared-base'
import { useMemo } from 'react'
import { z as zod } from 'zod'

const gtZero = (v: string) => isGreaterThan(v, 0)
export function useSchema(supported1559: boolean, minGasLimit = 21000) {
    const { _ } = useLingui()
    const gasLimit = zod
        .string()
        .min(1, _(msg`Enter gas limit`))
        .refine(
            (gasLimit) => isGreaterThan(gasLimit, minGasLimit) && isLessThan(gasLimit, 150_000),
            _(msg`Gas limit should be between ${minGasLimit} and 15.00M`),
        )
    return useMemo(() => {
        if (supported1559) {
            return zod.object({
                gasLimit,
                priorityFee: zod.string().refine(gtZero, _(msg`Max base fee should be greater than 0`)),
                baseFee: zod.string().refine(gtZero, _(msg`Max base fee should be greater than 0`)),
            })
        }
        return zod.object({
            gasLimit,
            gasPrice: zod.string().refine(gtZero, _(msg`Gas price should be greater than 0`)),
        })
    }, [supported1559, minGasLimit])
}
