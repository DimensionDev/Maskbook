import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { ApplicationEntry } from '@masknet/shared'
import { useState } from 'react'
import { TipsEntranceDialog } from './TipsEntranceDialog'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { TipsIcon } from '@masknet/icons'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        (() => {
            const name = base.name
            const icon = <TipsIcon />
            return {
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)

                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                {...EntryComponentProps}
                                icon={icon}
                                onClick={() => setOpen(true)}
                            />

                            <TipsEntranceDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                ApplicationEntryID: base.ID,
                icon,
                name,
                appBoardSortingDefaultPriority: 8,
                nextIdRequired: true,
            }
        })(),
    ],
}

export default sns
