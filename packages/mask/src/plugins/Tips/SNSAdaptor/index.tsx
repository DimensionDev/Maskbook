import { useEffect, useState } from 'react'
import { SNSAdaptorContext, PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginID, CrossIsolationMessages } from '@masknet/shared-base'
import { ApplicationEntry, PublicWalletSetting } from '@masknet/shared'
import { MaskColorVar } from '@masknet/theme'
import { Link } from '@mui/material'
import { SNSAdaptorPluginContext } from '@masknet/web3-providers'
import { base } from '../base.js'
import { TipTaskManager } from '../contexts/index.js'
import { guideStorageDefaultValue, setupStorage, storageDefaultValue } from '../storage/index.js'
import { TipsEntranceDialog } from './TipsEntranceDialog.js'
import { TipsRealmContent } from './components/TipsRealmContent/index.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(_, context) {
        SNSAdaptorPluginContext.setup(context)

        const storage = context.createKVStorage('memory', storageDefaultValue)
        const guideStorage = context.createKVStorage('persistent', guideStorageDefaultValue)
        setupStorage(storage, guideStorage)
    },
    ApplicationEntries: [
        (() => {
            const name = base.name
            const icon = <Icons.Tips size={36} />
            const iconFilterColor = 'rgba(247, 147, 30, 0.3)'
            return {
                category: 'dapp',
                description: (
                    <Trans
                        ns={PluginID.Tips}
                        i18nKey="description"
                        components={{
                            Link: (
                                <Link
                                    href="https://next.id/"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    style={{ color: MaskColorVar.primary }}
                                />
                            ),
                        }}
                    />
                ),
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    const clickHandler = () => setOpen(true)

                    useEffect(() => {
                        return CrossIsolationMessages.events.applicationDialogEvent.on(({ open, pluginID }) => {
                            if (pluginID !== PluginID.Tips) return
                            setOpen(open)
                        })
                    }, [])

                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                {...EntryComponentProps}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                onClick={
                                    EntryComponentProps.onClick
                                        ? () => EntryComponentProps.onClick?.(clickHandler)
                                        : clickHandler
                                }
                            />

                            <TipsEntranceDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                ApplicationEntryID: base.ID,
                icon,
                name,
                iconFilterColor,
                appBoardSortingDefaultPriority: 5,
                nextIdRequired: true,
                entryWalletConnectedNotRequired: true,
            }
        })(),
    ],
    SettingTabs: [
        {
            ID: PluginID.Tips,
            label: 'Tips',
            priority: 1,
            UI: {
                TabContent: PublicWalletSetting,
            },
        },
    ],
    GlobalInjection() {
        return <TipTaskManager />
    },
    TipsRealm: {
        ID: `${base.ID}_tips`,
        priority: 1,
        UI: {
            Content(props) {
                return (
                    <SNSAdaptorContext.Provider value={SNSAdaptorPluginContext.context}>
                        <TipsRealmContent {...props} />
                    </SNSAdaptorContext.Provider>
                )
            },
        },
    },
}

export default sns
