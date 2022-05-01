import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { setupContext } from './context'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { ApplicationEntry } from '@masknet/shared'
import { SwapIcon } from '@masknet/icons'
import TradeComposeDialog from './TradeComposeDialog'
import { TradeMetadataReader } from '../helpers'
import { PostPreview } from './PostPreview'
import { META_KEY } from '../constants'
import { useI18N } from '../locales/i18n_generated'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    DecryptedInspector: function Component(props) {
        const metadata = TradeMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        return <PostPreview info={metadata.val} {...props} />
    },
    CompositionDialogEntry: {
        label: (
            <>
                <SwapIcon style={{ width: 16, height: 16 }} />
                Traderxyz
            </>
        ),
        dialog: TradeComposeDialog,
    },
    CompositionDialogMetadataBadgeRender: new Map([[META_KEY, onAttachedFile]]),
    ApplicationEntries: [
        (() => {
            const icon = <img src={new URL('./assets/traderxyz.png', import.meta.url).toString()} />
            const name = { i18nKey: '__plugin_name', fallback: 'Traderxyz' }
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    const t = useI18N()
                    return (
                        <ApplicationEntry
                            title={t.display_name()}
                            disabled={disabled}
                            icon={icon}
                            onClick={() =>
                                CrossIsolationMessages.events.requestComposition.sendToLocal({
                                    reason: 'timeline',
                                    open: true,
                                    options: {
                                        startupPlugin: base.ID,
                                    },
                                })
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 2,
                marketListSortingPriority: 2,
                icon,
                category: 'dapp',
                description: {
                    i18nKey: '__plugin_description',
                    fallback: 'Traderxyz plugin, sell NFT faster and cheaper.',
                },
                name,
                tutorialLink:
                    'https://realmasknetwork.notion.site/Use-File-Service-via-Arweave-IPFS-SIA-Swarm-soon-8c8fe1efce5a48b49739a38f4ea8c60f',
            }
        })(),
    ],
}

export default sns

function onAttachedFile() {
    return 'Trader XYZ NFR Attached'
}
