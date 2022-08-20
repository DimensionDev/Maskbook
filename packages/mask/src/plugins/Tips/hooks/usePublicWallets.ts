import { PluginId } from '@masknet/plugin-infra'
import { BindingProof, EMPTY_LIST, NextIDPlatform, NextIDStorageInfo } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { uniqBy } from 'lodash-unified'
import { useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../utils'
import type { TipAccount } from '../types'
import { useKvGet } from './useKv'

export function usePublicWallets(personaPubkey: string | undefined): TipAccount[] {
    const { value: nextIdWallets, retry: queryWallets } = useAsyncRetry(async (): Promise<TipAccount[]> => {
        if (!personaPubkey) return EMPTY_LIST

        const bindings = await NextIDProof.queryExistedBindingByPersona(personaPubkey, true)
        if (!bindings) return EMPTY_LIST

        const wallets = bindings.proofs
            .filter((p) => p.platform === NextIDPlatform.Ethereum)
            .map((p) => ({ address: p.identity, verified: true }))
        return wallets
    }, [personaPubkey])

    const { value: kv, retry: refetchKv } = useKvGet<NextIDStorageInfo<BindingProof[]>>(personaPubkey)
    const walletsFromCloud = useMemo((): TipAccount[] | null => {
        if (!kv?.ok) return null
        const { proofs } = kv.val
        if (!proofs.length) return null
        const configuredTipsWallets = proofs.find((x) => x.identity === personaPubkey)?.content[PluginId.Tips]
        if (!configuredTipsWallets) return null

        const tipWallets = configuredTipsWallets.filter((x) => x.platform === NextIDPlatform.Ethereum)
        if (!tipWallets) return null
        return tipWallets
            .filter((x) => {
                if (nextIdWallets) {
                    // Sometimes, the wallet might get deleted from next.id
                    return x.isPublic && nextIdWallets.find((y) => isSameAddress(y.address, x.identity))
                } else {
                    return x.isPublic
                }
            })
            .sort((x) => (x.isDefault ? -1 : 0))
            .map((x) => ({ address: x.identity, verified: true }))
    }, [kv, nextIdWallets])

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            queryWallets()
            refetchKv()
        })
    }, [])

    return useMemo(() => {
        // If user configured wallets for tips, it couldn't be null.
        return walletsFromCloud || uniqBy(nextIdWallets || [], (x) => x.address)
    }, [nextIdWallets, walletsFromCloud])
}
