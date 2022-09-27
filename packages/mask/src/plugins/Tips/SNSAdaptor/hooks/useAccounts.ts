import { useMemo } from 'react'
import { uniqBy } from 'lodash-unified'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useCurrentWeb3NetworkPluginID, useSocialAddressListAll } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SocialAddressType } from '@masknet/web3-shared-base'
import { useOthersProofs } from './useOthersProofs.js'
import type { Recipient } from '../../types/index.js'

export function useAccounts(
    identity: IdentityResolved | undefined,
    personaPubkey: string | undefined,
    recipients: Recipient[],
) {
    const pluginId = useCurrentWeb3NetworkPluginID()
    const { value: socialAddressList = EMPTY_LIST } = useSocialAddressListAll(identity)
    const wallets = useOthersProofs(NextIDPlatform.Ethereum, personaPubkey)
    const accounts = useMemo(() => {
        switch (pluginId) {
            case NetworkPluginID.PLUGIN_EVM:
                const evmAddresses = socialAddressList
                    .filter((x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM)
                    .map((x) => ({
                        address: x.address,
                        name: x.type === SocialAddressType.ENS ? x.label : undefined,
                    }))
                return uniqBy([...wallets, ...recipients, ...evmAddresses], (v) => v.address.toLowerCase())
            case NetworkPluginID.PLUGIN_SOLANA:
                return socialAddressList
                    .filter((x) => x.networkSupporterPluginID === pluginId)
                    .map((x) => ({
                        address: x.address,
                        name: x.type === SocialAddressType.SOL ? x.label : undefined,
                    }))
        }
        return EMPTY_LIST
    }, [pluginId, wallets, recipients, socialAddressList])

    return accounts
}
