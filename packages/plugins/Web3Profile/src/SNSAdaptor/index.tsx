import { useEffect } from 'react'
import { Trans } from 'react-i18next'
import { type Plugin } from '@masknet/plugin-infra'
import { PluginID, CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { ApplicationEntry, PublicWalletSetting } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { PluginI18NFieldRender, SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { base } from '../base.js'
import { context, setupContext, setupStorage } from './context.js'
import { Web3ProfileDialog } from './components/Web3ProfileDialog.js'
import { FollowLensDialog } from './components/FollowLensDialog.js'
import { LensBadge } from './components/LensBadge.js'
import { LensPopup } from './components/LensPopup.js'
import { ChainContextProvider, useFireflyLensAccounts } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        setupContext(context)
        await setupStorage(context)
    },

    GlobalInjection: function Component() {
        return (
            <SNSAdaptorContext.Provider value={context}>
                <Web3ProfileDialog />
                <ChainContextProvider value={{ chainId: ChainId.Matic }}>
                    <FollowLensDialog />
                </ChainContextProvider>
                <LensPopup />
            </SNSAdaptorContext.Provider>
        )
    },
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
                const { value: accounts = EMPTY_LIST } = useFireflyLensAccounts(identity?.userId)

                const hasLens = !accounts.length
                useEffect(() => {
                    onStatusUpdate?.(hasLens)
                }, [onStatusUpdate, hasLens])

                if (!accounts.length || !identity?.userId) return null

                return <LensBadge slot={slot} accounts={accounts} userId={identity.userId} />
            },
        },
    },
}

export default sns
