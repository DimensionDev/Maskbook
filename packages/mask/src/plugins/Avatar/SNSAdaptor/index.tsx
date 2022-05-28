import type { Plugin } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { useState } from 'react'
import { NFTAvatarDialog } from '../Application/NFTAvatarsDialog'
import { base } from '../base'
import { setupContext } from '../context'
import { Trans } from 'react-i18next'
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
            const recommendFeature = {
                description: <Trans i18nKey="plugin_nft_avatar_recommend_feature_description" />,
                backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
            }
            return {
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                icon={icon}
                                recommendFeature={recommendFeature}
                                {...EntryComponentProps}
                                onClick={EntryComponentProps.onClick ?? (() => setOpen(true))}
                                tooltipHint={
                                    EntryComponentProps.tooltipHint ??
                                    (EntryComponentProps.disabled ? undefined : <Trans i18nKey="application_hint" />)
                                }
                            />

                            <NFTAvatarDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 2,
                marketListSortingPriority: 2,
                name,
                icon,
                ApplicationEntryID: base.ID,
                nextIdRequired: true,
                recommendFeature,
            }
        })(),
    ],
}

export default sns
