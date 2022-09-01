import { EMPTY_LIST, NextIDPlatform, ECKeyIdentifier } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { uniqBy } from 'lodash-unified'
import { useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../utils'
import type { TipAccount } from '../types'
import { useTipsSetting } from './useTipsSetting'

export function usePublicWallets(persona: ECKeyIdentifier | undefined): TipAccount[] {
    const personaPubkey = persona?.publicKeyAsHex
    const { value: nextIdWallets, retry: queryWallets } = useAsyncRetry(async (): Promise<TipAccount[]> => {
        if (!personaPubkey) return EMPTY_LIST

        const bindings = await NextIDProof.queryExistedBindingByPersona(personaPubkey, true)
        if (!bindings) return EMPTY_LIST

        const wallets = bindings.proofs
            .filter((p) => p.platform === NextIDPlatform.Ethereum)
            .map((p) => ({ address: p.identity, verified: true }))
        return wallets
    }, [personaPubkey])

    const { value: TipsSetting } = useTipsSetting(persona)

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            queryWallets()
        })
    }, [])

    return useMemo(() => {
        const result =
            nextIdWallets
                ?.filter((x) => !TipsSetting?.hiddenAddresses?.some((y) => isSameAddress(y, x.address)) ?? true)
                .sort((x) => (isSameAddress(x.address, TipsSetting?.defaultAddress) ? -1 : 0))
                .map((x) => ({ address: x.address, verified: true })) ?? EMPTY_LIST

        return uniqBy(result, (x) => x.address)
    }, [nextIdWallets, TipsSetting?.hiddenAddresses])
}
