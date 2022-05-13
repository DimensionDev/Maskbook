import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { useState } from 'react'
import { base } from '../base'
import { SavingsDialog } from './SavingsDialog'

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
                            disabled={disabled}
                            title="Savings"
                            icon={new URL('./assets/savings.png', import.meta.url).toString()}
                            onClick={() => setOpen(true)}
                        />
                        <SavingsDialog open={open} onClose={() => setOpen(false)} />
                    </>
                )
            },
            defaultSortingPriority: 7,
        },
    ],
}

export default sns
