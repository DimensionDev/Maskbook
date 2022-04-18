import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { useState } from 'react'
import { NFTAvatarDialog } from '../Application/NFTAvatarsDialog'
import { base } from '../base'
import { setupContext } from '../context'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled }) {
                const [open, setOpen] = useState(false)
                return (
                    <>
                        <ApplicationEntry
                            title="NFT Avatars"
                            disabled={disabled}
                            icon={new URL('../assets/nftavatar.png', import.meta.url).toString()}
                            onClick={() => setOpen(true)}
                        />
                        <NFTAvatarDialog open={open} onClose={() => setOpen(false)} />
                    </>
                )
            },
            defaultSortingPriority: 3,
        },
    ],
}

export default sns
