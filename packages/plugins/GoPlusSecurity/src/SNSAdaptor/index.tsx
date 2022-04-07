import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { CheckSecurityDialog } from './CheckSecurityDialog'
import { useState } from 'react'
import { ApplicationEntry } from '@masknet/shared'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        {
            RenderEntryComponent() {
                const [open, setOpen] = useState(false)
                return (
                    <>
                        <ApplicationEntry
                            title="Check Security"
                            icon={new URL('../assets/security-icon.png', import.meta.url).toString()}
                            onClick={() => setOpen(true)}
                        />
                        {open && <CheckSecurityDialog open={open} onClose={() => setOpen(false)} />}
                    </>
                )
            },
            defaultSortingPriority: 12,
        },
    ],
}

export default sns
