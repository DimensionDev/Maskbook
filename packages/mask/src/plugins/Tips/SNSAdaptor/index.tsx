import { Icons } from '@masknet/icons'
import { Plugin, PluginId } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { MaskColorVar } from '@masknet/theme'
import { Link } from '@mui/material'
import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'
import { base } from '../base'
import { PostTipButton, TipTaskManager } from '../components'
import { RootContext } from '../contexts'
import { setupStorage, storageDefaultValue } from '../storage'
import { TipsEntranceDialog } from './TipsEntranceDialog'
import { CrossIsolationMessages } from '@masknet/shared-base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(_, context) {
        setupStorage(context.createKVStorage('memory', storageDefaultValue))
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
                        ns={PluginId.Tips}
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
                        return CrossIsolationMessages.events.requestOpenApplication.on(({ open, application }) => {
                            if (application !== PluginId.Tips) return
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
                appBoardSortingDefaultPriority: 9,
                nextIdRequired: true,
            }
        })(),
    ],
    SettingTabs: [
        {
            ID: PluginId.Tips,
            label: 'Tips',
            priority: 1,
        },
    ],
    GlobalInjection() {
        return (
            <RootContext>
                <TipTaskManager />
            </RootContext>
        )
    },
    PostActions() {
        return (
            <RootContext>
                <PostTipButton />
            </RootContext>
        )
    },
}

export default sns
