import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress, isGreaterThan } from '@masknet/web3-shared-base'
import { uniqBy } from 'lodash-unified'
import { useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../utils/index.js'
import type { TipsAccount } from '../types/index.js'
import { useTipsSetting } from './useTipsSetting.js'

export function usePublicWallets(personaPubkey?: string): TipsAccount[] {
    const { value: nextIdWallets, retry: queryWallets } = useAsyncRetry(async (): Promise<TipsAccount[]> => {
        if (!personaPubkey) return EMPTY_LIST

        const bindings = await NextIDProof.queryExistedBindingByPersona(personaPubkey, true)
        if (!bindings) return EMPTY_LIST

        const wallets = bindings.proofs
            .filter((p) => p.platform === NextIDPlatform.Ethereum)
            .map((p) => ({ address: p.identity, verified: true, last_checked_at: p.last_checked_at }))
        return wallets
    }, [personaPubkey])

    const { value: TipsSetting } = useTipsSetting(personaPubkey)

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            queryWallets()
        })
    }, [])

    return useMemo(() => {
        const result =
            nextIdWallets
                ?.filter((x) => !TipsSetting?.hiddenAddresses?.some((y) => isSameAddress(y, x.address)) ?? true)
                .sort((a, z) => {
                    if (!a.last_checked_at || !z.last_checked_at) return 1
                    if (isGreaterThan(a.last_checked_at, z.last_checked_at)) {
                        return isSameAddress(z.address, TipsSetting?.defaultAddress) ? 1 : -1
                    }

                    return isSameAddress(a.address, TipsSetting?.defaultAddress) ? -1 : 1
                })
                .map((x) => ({ address: x.address, verified: true })) ?? EMPTY_LIST

        return uniqBy(result, (x) => x.address)
    }, [nextIdWallets, TipsSetting?.hiddenAddresses])
}
