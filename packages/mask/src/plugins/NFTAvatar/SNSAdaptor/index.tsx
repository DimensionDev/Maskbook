import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { useState } from 'react'
import { ApplicationIcon } from '../assets/application'
import { base } from '../base'
import { NFTAvatarDialog } from './NFTAvatarsDialog'

const badgeSvgIconSize = {
    width: 16,
    height: 16,
}
const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    CompositionDialogEntry: {
        label: {
            fallback: (
                <>
                    <ApplicationIcon style={{ width: 16, height: 16 }} />
                    NFT Avatars
                </>
            ),
        },
        dialog: NFTAvatarDialog,
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
