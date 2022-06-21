import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { ApprovalIcon } from '@masknet/icons'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { useState } from 'react'
import { base } from '../base'
import { ApprovalDialog } from './ApprovalDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        (() => {
            const icon = <ApprovalIcon />
            const name = { i18nKey: 'plugin_name', fallback: 'Approval' }
            const iconFilterColor = 'rgba(251, 176, 59, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    const clickHandler = () => setOpen(true)
                    return (
                        <>
                            <ApplicationEntry
                                {...EntryComponentProps}
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                onClick={
                                    EntryComponentProps.onClick
                                        ? () => EntryComponentProps.onClick?.(clickHandler)
                                        : clickHandler
                                }
                            />
                            {open ? <ApprovalDialog open={open} onClose={() => setOpen(false)} /> : null}
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 6,
                icon,
                name,
                iconFilterColor,
            }
        })(),
    ],
}

export default sns
