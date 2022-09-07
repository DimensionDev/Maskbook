import { useMemo } from 'react'
import { useCurrentWeb3NetworkPluginID, useSocialAddressListAll } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SocialAddressType } from '@masknet/web3-shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { usePublicWallets } from '../../hooks/usePublicWallets'
import type { TipsAccount } from '../../types'
import { uniqBy } from 'lodash-unified'

export function useTipsAccounts(
    identity: IdentityResolved | undefined,
    personaPubkey: string | undefined,
    addresses: TipsAccount[],
) {
    const pluginId = useCurrentWeb3NetworkPluginID()
    const { value: socialAddressList = EMPTY_LIST } = useSocialAddressListAll(identity)
    const publicWallets = usePublicWallets(personaPubkey)
    const tipsAccounts = useMemo(() => {
        switch (pluginId) {
            case NetworkPluginID.PLUGIN_EVM:
                const evmAddresses = socialAddressList
                    .filter((x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM)
                    .map((x) => ({
                        address: x.address,
                        name: x.type === SocialAddressType.ENS ? x.label : undefined,
                    }))
                return uniqBy([...publicWallets, ...addresses, ...evmAddresses], (v) => v.address.toLowerCase())
            case NetworkPluginID.PLUGIN_SOLANA:
                return socialAddressList
                    .filter((x) => x.networkSupporterPluginID === pluginId)
                    .map((x) => ({
                        address: x.address,
                        name: x.type === SocialAddressType.SOL ? x.label : undefined,
                    }))
        }
        return EMPTY_LIST
    }, [pluginId, publicWallets, addresses, socialAddressList])

    return tipsAccounts
}
