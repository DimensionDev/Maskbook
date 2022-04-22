import type { Plugin } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { Typography } from '@mui/material'
import { useState } from 'react'
import { NFTAvatarDialog } from '../Application/NFTAvatarsDialog'
import { ApplicationIcon } from '../assets/application'
import { base } from '../base'
import { setupContext } from '../context'
import { Translate, useI18N } from '../locales'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ApplicationEntries: [
        (() => {
            const [open, setOpen] = useState(false)
            const t = useI18N()
            const icon = <ApplicationIcon />
            const name = t.application_dialog_title()
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    return (
                        <>
                            <ApplicationEntry
                                title={name}
                                disabled={disabled}
                                icon={icon}
                                onClick={() => setOpen(true)}
                            />

                            <NFTAvatarDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 1,
                marketListSortingPriority: 1,
                icon,
                description: (
                    <Typography fontSize={12} style={{ whiteSpace: 'nowrap' }}>
                        <Translate.application_hint
                            components={{
                                br: <br />,
                            }}
                        />
                    </Typography>
                ),
                name,
                tutorialLink: '',
                category: 'dapp',
            }
        })(),
    ],
}

export default sns
