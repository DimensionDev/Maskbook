import { useMemo } from 'react'
import { isGreaterThan, isLessThanOrEqualTo } from '@masknet/web3-shared-base'
import { z as zod } from 'zod'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'

export function useSlippageToleranceSchema() {
    const { _ } = useLingui()

    return useMemo(() => {
        return zod.object({
            customSlippageTolerance: zod.string().refine(
                (value) => {
                    return isGreaterThan(value, 0) && isLessThanOrEqualTo(value, 50)
                },
                _(msg`Invalid slippage tolerance.`),
            ),
        })
    }, [_])
}
