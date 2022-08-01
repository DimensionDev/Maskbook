import { Icons } from '@masknet/icons'
import { Plugin, PluginI18NFieldRender, PluginId } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import type { EnhanceableSite } from '@masknet/shared-base'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'
import { NFTAvatarDialog } from '../Application/NFTAvatarsDialog'
import { base } from '../base'
import { PLUGIN_ID, SNS_KEY_MAP } from '../constants'
import { setupContext } from '../context'
import { NFTBadgeTimeline } from './NFTBadgeTimeline'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ApplicationEntries: [
        (() => {
            const name = { fallback: 'NFT PFP' }
            const icon = <Icons.NFTAvatar size={36} />
            const recommendFeature = {
                description: <Trans i18nKey="plugin_nft_avatar_recommend_feature_description" />,
                backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
            }
            return {
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    const clickHandler = () => setOpen(true)
                    useEffect(() => {
                        return CrossIsolationMessages.events.requestOpenApplication.on(({ open, application }) => {
                            if (application !== PluginId.Avatar) return
                            setOpen(open)
                        })
                    }, [])
                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                icon={icon}
                                recommendFeature={recommendFeature}
                                {...EntryComponentProps}
                                onClick={
                                    EntryComponentProps.onClick
                                        ? () => EntryComponentProps.onClick?.(clickHandler)
                                        : clickHandler
                                }
                                tooltipHint={
                                    EntryComponentProps.tooltipHint ??
                                    (EntryComponentProps.disabled ? undefined : <Trans i18nKey="application_hint" />)
                                }
                            />

                            <NFTAvatarDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 3,
                name,
                icon,
                ApplicationEntryID: base.ID,
                nextIdRequired: true,
                recommendFeature,
            }
        })(),
    ],
    AvatarRealm: {
        ID: `${PLUGIN_ID}_profile_card`,
        label: 'Avatar',
        priority: 99999,
        UI: {
            Decorator({ identity }) {
                if (!identity?.identifier?.userId) return null
                const snsKey = SNS_KEY_MAP[identity.identifier.network as EnhanceableSite]
                if (!snsKey) return null
                return (
                    <NFTBadgeTimeline
                        avatarId=""
                        width="100%"
                        height="100%"
                        snsKey={snsKey}
                        userId={identity.identifier.userId}
                    />
                )
            },
        },
    },
}

export default sns
