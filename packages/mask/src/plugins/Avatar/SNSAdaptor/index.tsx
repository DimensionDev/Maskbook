import { Icons } from '@masknet/icons'
import { Plugin, PluginID, PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { Trans } from 'react-i18next'
import { NFTAvatarDialog } from '../Application/NFTAvatarsDialog.js'
import { base } from '../base.js'
import { setupContext } from '../context.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    GlobalInjection() {
        return <NFTAvatarDialog />
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
                    const clickHandler = () => {
                        CrossIsolationMessages.events.applicationDialogEvent.sendToLocal({
                            open: true,
                            application: PluginID.Avatar,
                        })
                    }
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
}

export default sns
