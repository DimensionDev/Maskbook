import { useMemo } from 'react'
import { useAccount, useCurrentWeb3NetworkPluginID, useSocialAddressListAll } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { usePublicWallets } from '../../hooks/usePublicWallets.js'
import type { TipsAccount } from '../../types/index.js'
import { uniqBy } from 'lodash-unified'

export function useTipsAccounts(
    identity: IdentityResolved | undefined,
    personaPubkey: string | undefined,
    addresses: TipsAccount[],
) {
    const pluginId = useCurrentWeb3NetworkPluginID()
    const account = useAccount()
    const { value: socialAddressList = EMPTY_LIST } = useSocialAddressListAll(identity)
    const publicWallets = usePublicWallets(personaPubkey)
    const tipsAccounts = useMemo(() => {
        // If no wallet connected yet, return all wallets. (Only includes EVM and Solana by now.)
        const filter: (x: SocialAddress<NetworkPluginID>) => boolean = account
            ? (x) => x.networkSupporterPluginID === pluginId
            : (x) => [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(x.networkSupporterPluginID)

        const fromSocialAddresses = socialAddressList.filter(filter).map((x): TipsAccount => {
            const name = [SocialAddressType.ENS, SocialAddressType.SOL].includes(x.type) ? x.label : undefined
            return {
                pluginId: x.networkSupporterPluginID,
                address: x.address,
                isSocialAddress: true,
                name,
            }
        })

        const list =
            pluginId === NetworkPluginID.PLUGIN_EVM
                ? [...publicWallets, ...addresses, ...fromSocialAddresses]
                : fromSocialAddresses

        return uniqBy(list, (v) => v.pluginId + v.address.toLowerCase())
    }, [pluginId, account, publicWallets, addresses, socialAddressList])

    return tipsAccounts
}
