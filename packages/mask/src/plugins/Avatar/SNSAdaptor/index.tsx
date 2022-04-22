import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { Typography } from '@mui/material'
import { useState } from 'react'
import { NFTAvatarDialog } from '../Application/NFTAvatarsDialog'
import { base } from '../base'
import { setupContext } from '../context'
import { Translate } from '../locales'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { CollectiblesIcon } from '@masknet/icons'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ApplicationEntries: [
        (() => {
            const name = { i18nKey: 'application_dialog_title', fallback: 'NFT PFP' }
            const icon = <CollectiblesIcon />
            return {
                RenderEntryComponent({ disabled, nextIdVerification }) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                disabled={
                                    nextIdVerification?.isNextIdVerify === undefined ||
                                    !nextIdVerification?.isSNSConnectToCurrentPersona
                                        ? true
                                        : disabled
                                }
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
                                nextIdVerifyToolTipHint={nextIdVerification?.toolTipHint}
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
