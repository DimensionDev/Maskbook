import { Icons } from '@masknet/icons'
import { Plugin } from '@masknet/plugin-infra'
import { PluginTransFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { useFireflyFarcasterAccounts, useFireflyLensAccounts } from '@masknet/web3-hooks-base'
import { Web3Bio } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { uniqBy } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import { Trans } from '@lingui/react/macro'
import { base } from '../base.js'
import { Web3ProfileGlobalInjection } from './Web3ProfileGlobalInjection.js'
import { setupStorage } from './context.js'
import { SocialBadges } from './components/SocialBadges/Badges.js'
import { Web3BioProfileToFireflyLens } from '../utils.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        await setupStorage(context)
    },

    GlobalInjection: Web3ProfileGlobalInjection,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Web3Profile size={36} />
            const name = <Trans>Web3 Profile</Trans>
            return {
                RenderEntryComponent(EntryComponentProps) {
                    useEffect(() => {
                        return CrossIsolationMessages.events.applicationDialogEvent.on(({ open, pluginID }) => {
                            if (pluginID !== PluginID.Web3Profile) return
                            CrossIsolationMessages.events.web3ProfileDialogEvent.sendToLocal({ open })
                        })
                    }, [])

                    return (
                        <ApplicationEntry
                            {...EntryComponentProps}
                            title={<PluginTransFieldRender field={name} pluginID={base.ID} />}
                            icon={icon}
                            onClick={() =>
                                EntryComponentProps.onClick ?
                                    EntryComponentProps.onClick()
                                :   CrossIsolationMessages.events.web3ProfileDialogEvent.sendToLocal({
                                        open: true,
                                    })
                            }
                        />
                    )
                },
                ApplicationEntryID: base.ID,
                appBoardSortingDefaultPriority: 3,
                marketListSortingPriority: 3,
                name,
                icon,
                nextIdRequired: true,
                category: 'dapp',
                description: <Trans>Choose and show your Web3 footprints on X.</Trans>,
            }
        })(),
    ],
    Badges: {
        ID: `${base.ID}_badges`,
        UI: {
            Content({ identity, slot, onStatusUpdate }) {
                const userId = identity?.userId

                // #region lens
                const { data: accounts = EMPTY_LIST } = useFireflyLensAccounts(userId, true)
                const isProfile = slot === Plugin.SiteAdaptor.BadgesSlot.ProfileName

                const handle = accounts[0]?.handle
                const { data: nextIdLens = EMPTY_LIST } = useQuery({
                    queryKey: ['next-id', 'all-lens', userId, handle],
                    enabled: isProfile && !!handle && !!accounts.length,
                    queryFn: async () => {
                        const lensAccounts = await Web3Bio.getAllLens(handle)
                        return lensAccounts.map(Web3BioProfileToFireflyLens)
                    },
                })

                const lensAccounts = useMemo(
                    () => (isProfile ? uniqBy([...accounts, ...nextIdLens], (x) => x.handle) : accounts),
                    [isProfile, accounts, nextIdLens],
                )
                // #endregion

                // #region farcaster
                const { data: farcasterAccounts = EMPTY_LIST } = useFireflyFarcasterAccounts(userId)
                // #endregion

                const disabled = !lensAccounts.length && !farcasterAccounts.length
                useEffect(() => {
                    onStatusUpdate?.(disabled)
                }, [onStatusUpdate, disabled])

                if (!accounts.length || !userId) return null

                return (
                    <SocialBadges
                        slot={slot}
                        lensAccounts={lensAccounts}
                        farcasterAccounts={farcasterAccounts}
                        userId={userId}
                    />
                )
            },
        },
    },
}

export default site
