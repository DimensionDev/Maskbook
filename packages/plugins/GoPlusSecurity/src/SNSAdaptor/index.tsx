import type { Plugin } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { base } from '../base'
import { CheckSecurityDialog } from './CheckSecurityDialog'
import { useState } from 'react'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { Trans } from 'react-i18next'
import { setupContext } from './context'
import CheckSecurityConfirmDialog from './components/CheckSecurityConfirmDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    GlobalInjection: function Component() {
        return <CheckSecurityConfirmDialog />
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.SecurityChecker size={36} />
            const name = { i18nKey: '__plugin_name', fallback: 'Check Security' }

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
                            {open && <CheckSecurityDialog open={open} onClose={() => setOpen(false)} />}
                        </>
                    )
                },
                name,
                icon,
                appBoardSortingDefaultPriority: 14,
                category: 'dapp',
                marketListSortingPriority: 16,
                description: <Trans i18nKey="plugin_goPlusSecurity_description" />,
            }
        })(),
    ],
}

export default sns
