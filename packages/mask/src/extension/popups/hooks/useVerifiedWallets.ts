import { type BindingProof, NextIDPlatform, EMPTY_LIST } from '@masknet/shared-base'
import { isGreaterThan } from '@masknet/web3-shared-base'
import { useMemo } from 'react'

export function useVerifiedWallets(proofs?: BindingProof[]) {
    return useMemo(() => {
        if (!proofs?.length) return EMPTY_LIST
        return proofs
            .filter((x) => x.platform === NextIDPlatform.Ethereum)
            .sort((a, z) => (isGreaterThan(a.last_checked_at, z.last_checked_at) ? -1 : 1))
    }, [proofs])
}
