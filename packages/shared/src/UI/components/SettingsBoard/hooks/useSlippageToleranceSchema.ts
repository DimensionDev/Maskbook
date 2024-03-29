import { useMemo } from 'react'
import { useSharedTrans } from '@masknet/shared'
import { isGreaterThan, isLessThanOrEqualTo } from '@masknet/web3-shared-base'
import { z as zod } from 'zod'

export function useSlippageToleranceSchema() {
    const t = useSharedTrans()

    return useMemo(() => {
        return zod.object({
            customSlippageTolerance: zod.string().refine((value) => {
                return isGreaterThan(value, 0) && isLessThanOrEqualTo(value, 50)
            }, t.gas_settings_error_custom_slippage_tolerance_invalid()),
        })
    }, [t])
}
