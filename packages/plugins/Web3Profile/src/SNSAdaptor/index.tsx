import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { Web3ProfileIcon } from '@masknet/icons'
import { useState } from 'react'
import { base } from '../base'
import { Web3ProfileDialog } from './components/Web3ProfileDialog'
import { setupContext } from './context'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ApplicationEntries: [
        (() => {
            const icon = <Web3ProfileIcon />
            const name = { i18nKey: '__plugin_name', fallback: 'Web3-Profile' }
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                disabled={disabled}
                                icon={icon}
                                onClick={() => setOpen(true)}
                            />
                            <Web3ProfileDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 12,
                name,
                icon,
            }
        })(),
    ],
}

export default sns
