import type { Plugin } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { base } from '../base'
import { CheckSecurityDialog } from './CheckSecurityDialog'
import { useState } from 'react'
import { ApplicationEntry } from '@masknet/shared'
import { SecurityCheckerIcon } from '@masknet/icons'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        (() => {
            const icon = <SecurityCheckerIcon />
            const name = { fallback: 'Check Security' }
            const iconFilterColor = 'rgba(69, 110, 255, 0.3)'

            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                disabled={disabled}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                onClick={() => setOpen(true)}
                            />
                            {open && <CheckSecurityDialog open={open} onClose={() => setOpen(false)} />}
                        </>
                    )
                },
                name,
                icon,
                iconFilterColor,
                appBoardSortingDefaultPriority: 13,
                marketListSortingPriority: 16,
            }
        })(),
    ],
}

export default sns
