import { useWeb3State } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST, NextIDPlatform, ECKeyIdentifier } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { uniqBy } from 'lodash-unified'
import { useEffect, useMemo } from 'react'
import { useAsync, useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../utils'
import type { TipAccount } from '../types'
import { useTipsSetting } from './useTipsSetting'

export function usePublicWallets(persona: ECKeyIdentifier | undefined): TipAccount[] {
    const personaPubkey = persona?.publicKeyAsHex
    const { Storage } = useWeb3State()
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

    // Hide the addresses configure by the user and sort by default address
    const { value: walletsFromCloud } = useAsync(async () => {
        return (
            nextIdWallets
                ?.filter((x) => !TipsSetting?.hiddenAddresses?.some((y) => isSameAddress(y, x.address)) ?? true)
                .sort((x) => (isSameAddress(x.address, TipsSetting?.defaultAddress) ? -1 : 0))
                .map((x) => ({ address: x.address, verified: true })) ?? EMPTY_LIST
        )
    }, [persona, Storage, nextIdWallets, TipsSetting])

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            queryWallets()
        })
    }, [])

    return useMemo(() => {
        // If user configured wallets for tips, it couldn't be null.
        return walletsFromCloud || uniqBy(nextIdWallets || [], (x) => x.address)
    }, [nextIdWallets, walletsFromCloud])
}
