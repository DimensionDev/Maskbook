import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { Typography } from '@mui/material'
import { useState } from 'react'
import { NFTAvatarDialog } from '../Application/NFTAvatarsDialog'
import { base } from '../base'
import { setupContext } from '../context'
import { Translate, useI18N } from '../locales'

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
                            title={t.application_dialog_title()}
                            disabled={disabled}
                            icon={new URL('../assets/nftavatar.png', import.meta.url).toString()}
                            onClick={() => setOpen(true)}
                            tooltipProps={{
                                arrow: true,
                                placement: 'top',
                            }}
                            hint={
                                <Typography fontSize={12} style={{ whiteSpace: 'nowrap' }}>
                                    <Translate.application_hint
                                        components={{
                                            br: <br />,
                                        }}
                                    />
                                </Typography>
                            }
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
