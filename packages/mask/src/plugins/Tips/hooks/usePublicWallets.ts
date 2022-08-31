import { PluginId } from '@masknet/plugin-infra'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST, NextIDPlatform, BindingProof } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { uniqBy } from 'lodash-unified'
import { useEffect, useMemo } from 'react'
import { useAsync, useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../utils'
import type { TipsAccount } from '../types'

export function usePublicWallets(personaPubkey?: string): TipsAccount[] {
    const { Storage } = useWeb3State()
    const { value: nextIdWallets, retry: queryWallets } = useAsyncRetry(async (): Promise<TipsAccount[]> => {
        if (!personaPubkey) return EMPTY_LIST

        const bindings = await NextIDProof.queryExistedBindingByPersona(personaPubkey, true)
        if (!bindings) return EMPTY_LIST

        const wallets = bindings.proofs
            .filter((p) => p.platform === NextIDPlatform.Ethereum)
            .map((p) => ({ address: p.identity, verified: true }))
        return wallets
    }, [personaPubkey])

    const { value: walletsFromCloud } = useAsync(async () => {
        if (!Storage || !personaPubkey) return null
        const storage = Storage.createNextIDStorage(personaPubkey, NextIDPlatform.NextID, personaPubkey)
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
    }, [personaPubkey, Storage, nextIdWallets])

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
