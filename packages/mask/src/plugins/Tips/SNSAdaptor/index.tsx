import { TipsIcon } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { useState } from 'react'
import { base } from '../base'
import { PostTipButton, TipTaskManager } from '../components'
import { RootContext } from '../contexts'
import { setupStorage, storageDefaultValue } from '../storage'
import { TipsEntranceDialog } from './TipsEntranceDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(_, context) {
        setupStorage(context.createKVStorage('memory', '', storageDefaultValue))
    },
    ApplicationEntries: [
        (() => {
            const name = base.name
            const icon = <TipsIcon />
            const iconFilterColor = 'rgba(247, 147, 30, 0.3)'
            return {
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)

                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                {...EntryComponentProps}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                onClick={EntryComponentProps.onClick ?? (() => setOpen(true))}
                            />

                            <TipsEntranceDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                ApplicationEntryID: base.ID,
                icon,
                name,
                iconFilterColor,
                appBoardSortingDefaultPriority: 8,
                nextIdRequired: true,
            }
        })(),
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
