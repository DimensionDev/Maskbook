import type { IdentityResolved } from '@masknet/plugin-infra'
import { EMPTY_LIST, EnhanceableSite, NetworkPluginID, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { SocialAccount, SocialAddressType } from '@masknet/web3-shared-base'
import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../utils/index.js'
import { getLatestBinding } from '../utils/index.js'

// TODO Sync with configuration.
type NextIDSupportedSite = EnhanceableSite.Twitter
const hostSiteToNextIDPlatform: Record<NextIDSupportedSite, NextIDPlatform> = {
    [EnhanceableSite.Twitter]: NextIDPlatform.Twitter,
}

export function usePublicWallets(identity?: IdentityResolved): SocialAccount[] {
    const { value: nextIdWallets, retry: queryWallets } = useAsyncRetry(async (): Promise<SocialAccount[]> => {
        if (!identity?.identifier?.network) return EMPTY_LIST

        const bindings = await NextIDProof.queryAllExistedBindingsByPlatform(
            hostSiteToNextIDPlatform[identity.identifier.network as NextIDSupportedSite],
            identity.identifier.userId,
        )
        if (!bindings.length) return EMPTY_LIST

        const latestBinding = getLatestBinding(bindings)

        const accounts: SocialAccount[] = latestBinding.proofs
            .filter((p) => p.platform === NextIDPlatform.Ethereum)
            .map(
                (p): SocialAccount => ({
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                    supportedAddressTypes: [SocialAddressType.NEXT_ID],
                    label: '',
                    address: p.identity,
                }),
            )
        return accounts
    }, [identity?.identifier?.network, identity?.identifier?.userId])

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            queryWallets()
        })
    }, [])

    return nextIdWallets ?? EMPTY_LIST
}
