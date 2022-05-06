import type { Plugin } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { Typography } from '@mui/material'
import { useState } from 'react'
import { NFTAvatarDialog } from '../Application/NFTAvatarsDialog'
import { base } from '../base'
import { setupContext } from '../context'
import { Translate } from '../locales'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationIcon } from '../assets/application'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ApplicationEntries: [
        (() => {
            const name = { fallback: 'NFT PFP' }
            const icon = <ApplicationIcon />
            return {
                RenderEntryComponent({ disabled, tooltipHint }) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                icon={icon}
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
                name,
                icon,
                ApplicationEntryID: base.ID,
                nextIdRequired: true,
            }
        })(),
    ],
}

export default sns
