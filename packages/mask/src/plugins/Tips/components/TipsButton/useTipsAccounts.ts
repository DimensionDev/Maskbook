import { useMemo } from 'react'
import { groupBy, uniq } from 'lodash-unified'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { isSameAddress, SocialAccount } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID, useSocialAddressListAll } from '@masknet/web3-hooks-base'
import { useTipsSetting } from '../../hooks/useTipsSetting.js'

export function useTipsAccounts(
    identity: IdentityResolved | undefined,
    personaPubkey: string | undefined,
    accounts: SocialAccount[],
) {
    const pluginID = useCurrentWeb3NetworkPluginID()
    const { value: TipsSetting } = useTipsSetting(personaPubkey)
    const { value: socialAddressList = EMPTY_LIST } = useSocialAddressListAll(identity)

    return useMemo(() => {
        const accountsGrouped = groupBy(
            [
                ...accounts,
                ...socialAddressList.map((x) => ({
                    ...x,
                    supportedAddressTypes: [x.type],
                })),
            ].filter((x) => !TipsSetting?.hiddenAddresses?.some((y) => isSameAddress(y, x.address))),
            (x) => `${x.pluginID}_${x.address.toLowerCase()}`,
        )
        return Object.entries(accountsGrouped).map(([, group]) => {
            return group.reduce(
                (accumulator, account) => ({
                    ...account,
                    supportedAddressTypes: uniq([
                        ...(account.supportedAddressTypes ?? []),
                        ...(accumulator?.supportedAddressTypes ?? []),
                    ]),
                }),
                group[0],
            )
        })
    }, [pluginID, accounts, socialAddressList, TipsSetting?.hiddenAddresses])
}
