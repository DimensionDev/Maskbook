import { OKX } from '@masknet/web3-providers'
import type { ApproveTransactionOptions } from '@masknet/web3-providers/types'
import { useCallback } from 'react'

export function useApproveSwapTransaction() {
    return useCallback(async (options: ApproveTransactionOptions) => {
        const res = await OKX.approveSwapTransaction(options)
    }, [])
}
