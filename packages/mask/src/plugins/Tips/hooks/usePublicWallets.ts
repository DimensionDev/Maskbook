import { PluginId } from '@masknet/plugin-infra'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST, NextIDPlatform, ECKeyIdentifier, BindingProof } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { uniqBy } from 'lodash-unified'
import { useEffect, useMemo } from 'react'
import { useAsync, useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../utils'
import type { TipAccount } from '../types'

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

    const { value: walletsFromCloud } = useAsync(async () => {
        if (!Storage || !persona) return null
        const storage = Storage.createNextIDStorage(
            persona.publicKeyAsHex,
            NextIDPlatform.NextID,
            persona.publicKeyAsHex,
        )
        const wallets = (await storage.get<BindingProof[]>(PluginId.Tips))?.filter(
            (x) => x.platform === NextIDPlatform.Ethereum,
        )

        if (!wallets) return null

        return wallets
            .filter((x) => {
                if (nextIdWallets) {
                    // Sometimes, the wallet might get deleted from next.id
                    return x.isPublic && nextIdWallets.find((y) => isSameAddress(y.address, x.identity))
                }
                return x.isPublic
            })
            .sort((x) => (x.isDefault ? -1 : 0))
            .map((x) => ({ address: x.identity, verified: true }))
    }, [persona, Storage, nextIdWallets])

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
