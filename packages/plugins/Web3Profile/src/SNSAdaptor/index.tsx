import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { useState } from 'react'
import { base } from '../base'
import { Web3ProfileDialog } from './components/Web3ProfileDialog'
import { setupContext } from './context'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ApplicationEntries: [
        {
            RenderEntryComponent() {
                const [open, setOpen] = useState(false)
                return (
                    <>
                        <ApplicationEntry
                            title="Web3 Profile"
                            icon={new URL('./assets/web3-profile.png', import.meta.url).toString()}
                            onClick={() => setOpen(true)}
                        />
                        <Web3ProfileDialog open={open} onClose={() => setOpen(false)} />
                    </>
                )
            },
            defaultSortingPriority: 12,
        },
    ],
}

export default sns
