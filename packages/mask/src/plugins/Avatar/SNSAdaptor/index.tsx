import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { useState } from 'react'
import { NFTAvatarDialog } from '../Application/NFTAvatarsDialog'
import { base } from '../base'
import { setupContext } from '../context'
import { useI18N } from '../locales'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled }) {
                const [open, setOpen] = useState(false)
                const t = useI18N()
                return (
                    <>
                        <ApplicationEntry
                            title="NFT Avatars"
                            disabled={disabled}
                            icon={new URL('../assets/nftavatar.png', import.meta.url).toString()}
                            onClick={() => setOpen(true)}
                            tooltipProps={{
                                arrow: true,
                                placement: 'top',
                            }}
                            hint={t.application_hint()}
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
