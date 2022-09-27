import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { Plugin, PluginID } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry, PublicWalletSetting } from '@masknet/shared'
import { MaskColorVar } from '@masknet/theme'
import { Link } from '@mui/material'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { base } from '../base.js'
import { setupStorage, STORAGE_DEFAULT_VALUE } from '../storage/index.js'
import { EntranceDialog } from './EntranceDialog/index.js'
import { RealmContent } from './RealmContent/index.js'
import { TipsTaskManager } from './Tips/TipsTaskManager/index.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(_, context) {
        setupStorage(context.createKVStorage('memory', STORAGE_DEFAULT_VALUE))
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
                        return CrossIsolationMessages.events.applicationDialogEvent.on(({ open, application }) => {
                            if (application !== PluginID.Tips) return
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

                            <EntranceDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                ApplicationEntryID: base.ID,
                icon,
                name,
                iconFilterColor,
                appBoardSortingDefaultPriority: 9,
                nextIdRequired: true,
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
        return <TipsTaskManager />
    },
    TipsRealm: {
        ID: `${base.ID}_tips`,
        priority: 1,
        UI: {
            Content: RealmContent,
        },
    },
}

export default sns
