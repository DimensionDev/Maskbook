import { uniqBy } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import { Trans } from 'react-i18next'
import { Plugin } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { ApplicationEntry } from '@masknet/shared'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { NextIdLensToFireflyLens } from './components/LensPopup.js'
import { useFireflyLensAccounts } from '@masknet/web3-hooks-base'
import { NextIDProof } from '@masknet/web3-providers'
import { CrossIsolationMessages, EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { base } from '../base.js'
import { LensBadge } from './components/LensBadge.js'
import { Web3ProfileGlobalInjection } from './Web3ProfileGlobalInjection.js'
import { setupContext, setupStorage } from './context.js'
import { useQuery } from '@tanstack/react-query'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        setupContext(context)
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
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                icon={icon}
                                onClick={() =>
                                    EntryComponentProps?.onClick
                                        ? EntryComponentProps.onClick()
                                        : CrossIsolationMessages.events.web3ProfileDialogEvent.sendToLocal({
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
                const { data: accounts = EMPTY_LIST } = useFireflyLensAccounts(identity?.userId)
                const isProfile = slot === Plugin.SNSAdaptor.LensSlot.ProfileName

                const handle = accounts[0]?.handle
                const { data: nextIdLens = EMPTY_LIST } = useQuery({
                    queryKey: ['next-id', 'all-lens', identity?.userId],
                    enabled: isProfile && !!handle,
                    queryFn: async () => {
                        const lensAccounts = await NextIDProof.queryAllLens(handle)
                        return lensAccounts.map(NextIdLensToFireflyLens)
                    },
                })

                const lensAccounts = useMemo(
                    () => (isProfile ? uniqBy([...accounts, ...nextIdLens], (x) => x.handle) : accounts),
                    [isProfile, accounts, nextIdLens],
                )

                const hasLens = !lensAccounts.length
                useEffect(() => {
                    onStatusUpdate?.(hasLens)
                }, [onStatusUpdate, hasLens])

                if (!lensAccounts.length || !identity?.userId) return null

                return <LensBadge slot={slot} accounts={lensAccounts} userId={identity.userId} />
            },
        },
    },
}

export default sns
