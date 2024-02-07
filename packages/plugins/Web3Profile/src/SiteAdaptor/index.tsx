import { Icons } from '@masknet/icons'
import { Plugin } from '@masknet/plugin-infra'
import { PluginTransFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { useFireflyLensAccounts } from '@masknet/web3-hooks-base'
import { NextIDProof, Firefly, Twitter } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { uniqBy } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import { Trans } from 'react-i18next'
import { base } from '../base.js'
import { Web3ProfileGlobalInjection } from './Web3ProfileGlobalInjection.js'
import { FarcasterBadge } from './components/Farcaster/FarcasterBadge.js'
import { LensBadge } from './components/Lens/LensBadge.js'
import { NextIdLensToFireflyLens } from './components/Lens/LensPopup.js'
import { setupStorage } from './context.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        await setupStorage(context)
    },

    GlobalInjection: Web3ProfileGlobalInjection,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Web3Profile size={36} />
            const name = <Trans ns={PluginID.Web3Profile} i18nKey="web3_profile" />
            return {
                RenderEntryComponent(EntryComponentProps) {
                    useEffect(() => {
                        return CrossIsolationMessages.events.applicationDialogEvent.on(({ open, pluginID }) => {
                            if (pluginID !== PluginID.Web3Profile) return
                            CrossIsolationMessages.events.web3ProfileDialogEvent.sendToLocal({ open })
                        })
                    }, [])

                    return (
                        <>
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
                        </>
                    )
                },
                ApplicationEntryID: base.ID,
                appBoardSortingDefaultPriority: 3,
                marketListSortingPriority: 3,
                name,
                icon,
                nextIdRequired: true,
                category: 'dapp',
                description: (
                    <Trans
                        i18nKey="__plugin_description"
                        defaults="Choose and showcase your Web3 footprints on Twitter."
                        ns={base.ID}
                    />
                ),
            }
        })(),
    ],
    Lens: {
        ID: `${base.ID}_lens`,
        UI: {
            Content({ identity, slot, onStatusUpdate }) {
                const userId = identity?.userId
                const { data: accounts = EMPTY_LIST } = useFireflyLensAccounts(userId, true)
                const isProfile = slot === Plugin.SiteAdaptor.LensSlot.ProfileName

                const handle = accounts[0]?.handle
                const { data: nextIdLens = EMPTY_LIST } = useQuery({
                    queryKey: ['next-id', 'all-lens', userId],
                    enabled: isProfile && !!handle && !!accounts.length,
                    queryFn: async () => {
                        const lensAccounts = await NextIDProof.queryAllLens(handle)
                        return lensAccounts.map(NextIdLensToFireflyLens)
                    },
                })

                const lensAccounts = useMemo(
                    () => (isProfile ? uniqBy([...accounts, ...nextIdLens], (x) => x.handle) : accounts),
                    [isProfile, accounts, nextIdLens],
                )

                const disabled = !lensAccounts.length
                useEffect(() => {
                    onStatusUpdate?.(disabled)
                }, [onStatusUpdate, disabled])

                if (!accounts.length || !userId) return null

                return <LensBadge slot={slot} accounts={lensAccounts} userId={userId} />
            },
        },
    },
    Farcaster: {
        ID: `${base.ID}_farcaster`,
        UI: {
            Content({ identity, slot, onStatusUpdate }) {
                const userId = identity?.userId

                const { data: profiles } = useQuery({
                    queryKey: ['union-profile', 'by-twitter-id', userId],
                    queryFn: async () => {
                        if (!userId) return null
                        const user = await Twitter.getUserByScreenName(userId)
                        if (!user?.userId) return
                        return Firefly.getUnionProfile({
                            twitterId: user?.userId,
                        })
                    },
                })
                const disabled = !profiles?.farcasterProfiles?.length

                useEffect(() => {
                    onStatusUpdate?.(disabled)
                }, [onStatusUpdate, disabled])
                if (!userId) return null
                const accounts = profiles?.farcasterProfiles ?? EMPTY_LIST
                return <FarcasterBadge slot={slot} accounts={accounts} userId={userId} />
            },
        },
    },
}

export default site
