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
            RenderEntryComponent({ disabled, AppIcon }) {
                const [open, setOpen] = useState(false)
                return (
                    <>
                        <ApplicationEntry
                            title="Check Security"
                            disabled={disabled}
                            AppIcon={AppIcon}
                            onClick={() => setOpen(true)}
                        />
                        {open && <CheckSecurityDialog open={open} onClose={() => setOpen(false)} />}
                    </>
                )
            },
            name: 'Check Security',
            description: '',
            AppIcon: <SecurityCheckerIcon />,
            appBoardSortingDefaultPriority: 13,
            marketListSortingPriority: 16,
        },
    ],
}

export default sns
