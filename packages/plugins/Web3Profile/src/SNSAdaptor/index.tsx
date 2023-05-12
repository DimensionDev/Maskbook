import { Icons } from '@masknet/icons'
import { type Plugin } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry, PublicWalletSetting } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { Firefly } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Trans } from 'react-i18next'
import { base } from '../base.js'
import { LensBadge } from './components/LensBadge.js'
import { setupContext, setupStorage } from './context.js'
import { Web3ProfileGlobalInjection } from './Web3ProfileGlobalInjection.js'

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
    SettingTabs: [
        {
            ID: PluginID.Web3Profile,
            label: 'Web3Profile',
            priority: 2,
            UI: {
                TabContent: PublicWalletSetting,
            },
        },
    ],
    Lens: {
        ID: `${base.ID}_lens`,
        UI: {
            Content({ identity, slot, onStatusUpdate }) {
                const { data: accounts = EMPTY_LIST } = useQuery({
                    queryKey: [identity?.userId],
                    enabled: !!identity?.userId,
                    queryFn: async () => {
                        if (!identity?.userId) return
                        return Firefly.getLensByTwitterId(identity.userId)
                    },
                })

                const hasLens = !accounts.length
                useEffect(() => {
                    onStatusUpdate?.(hasLens)
                }, [onStatusUpdate, hasLens])

                if (!accounts.length) return null

                return <LensBadge slot={slot} accounts={accounts} />
            },
        },
    },
}

export default sns
