import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { ApplicationEntry } from '@masknet/shared'
import { useState } from 'react'
import { TipsEntranceDialog } from './TipsEntranceDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled }) {
                const [open, setOpen] = useState(false)
                return (
                    <>
                        <ApplicationEntry
                            title="Tips"
                            disabled={disabled}
                            icon={new URL('../assets/Tip.png', import.meta.url).toString()}
                            onClick={() => setOpen(true)}
                        />
                        <TipsEntranceDialog open={open} onClose={() => setOpen(false)} />
                    </>
                )
            },
            defaultSortingPriority: 8,
        },
    ],
}

export default sns
