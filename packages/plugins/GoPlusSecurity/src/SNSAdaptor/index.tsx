import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { CheckSecurityDialog } from './CheckSecurityDialog'
import { useState } from 'react'
import { ApplicationEntry } from '@masknet/shared'
import { SecurityCheckerIcon } from '@masknet/icons'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled, icon, title }) {
                const [open, setOpen] = useState(false)
                return (
                    <>
                        <ApplicationEntry title={title} disabled={disabled} icon={icon} onClick={() => setOpen(true)} />
                        {open && <CheckSecurityDialog open={open} onClose={() => setOpen(false)} />}
                    </>
                )
            },
            name: { i18nKey: 'plugin_name', fallback: 'Check Security' },
            icon: <SecurityCheckerIcon />,
            appBoardSortingDefaultPriority: 13,
            marketListSortingPriority: 16,
        },
    ],
}

export default sns
