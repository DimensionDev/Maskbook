import { useMemo } from 'react'
import { groupBy, uniq } from 'lodash-unified'
import { useCurrentWeb3NetworkPluginID, useSocialAddressListAll } from '@masknet/web3-hooks-base'
import { isSameAddress, SocialAddressType } from '@masknet/web3-shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { usePublicWallets } from '../../hooks/usePublicWallets.js'
import type { TipsAccount } from '../../types/index.js'
import { useTipsSetting } from '../../hooks/useTipsSetting.js'

const ENABLE_PLUGINS = [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA]
export function useTipsAccounts(
    identity: IdentityResolved | undefined,
    personaPubkey: string | undefined,
    addresses: TipsAccount[],
) {
    const pluginId = useCurrentWeb3NetworkPluginID()
    const { value: socialAddressList = EMPTY_LIST } = useSocialAddressListAll(identity)
    const { value: TipsSetting } = useTipsSetting(personaPubkey)

    const publicWallets = usePublicWallets(personaPubkey, TipsSetting?.defaultAddress)

    const tipsAccounts = useMemo(() => {
        const fromSocialAddresses = socialAddressList
            .filter((x) => ENABLE_PLUGINS.includes(x.networkSupporterPluginID))
            .map((x): TipsAccount => {
                const name = [
                    SocialAddressType.ENS,
                    SocialAddressType.SOL,
                    SocialAddressType.RSS3,
                    SocialAddressType.CyberConnect,
                    SocialAddressType.Sybil,
                    SocialAddressType.Leaderboard,
                ].includes(x.type)
                    ? x.label
                    : undefined
                return {
                    pluginId: x.networkSupporterPluginID,
                    address: x.address,
                    isSocialAddress: true,
                    name,
                    supportedTypes: [x.type],
                }
            })
        const list = [...publicWallets, ...addresses, ...fromSocialAddresses].filter(
            (x) => !TipsSetting?.hiddenAddresses?.some((y) => isSameAddress(y, x.address)),
        )
        const listGrouped = groupBy(list, (x) => `${x.pluginId}_${x.address.toLowerCase()}`)
        return Object.entries(listGrouped).map(([, group]) => {
            return group.reduce(
                (accumulator, account) => ({
                    ...account,
                    supportedTypes: uniq([...(account.supportedTypes ?? []), ...(accumulator?.supportedTypes ?? [])]),
                }),
                group[0],
            )
        })
    }, [pluginId, publicWallets, addresses, socialAddressList, TipsSetting?.hiddenAddresses])

    return tipsAccounts
}
