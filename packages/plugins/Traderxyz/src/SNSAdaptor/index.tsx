// /* eslint-disable no-restricted-imports */
// /* eslint-disable spaced-comment */
// /* eslint-disable eqeqeq */
// /* eslint-disable @typescript-eslint/no-explicit-any */
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

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    DecryptedInspector: function Component(props) {
        const metadata = TradeMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        console.log('metadata.ok=', props)
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
        {
            RenderEntryComponent({ disabled }) {
                return (
                    <ApplicationEntry
                        title="Traderxyz"
                        disabled={disabled}
                        icon={new URL('./traderxyz.png', import.meta.url).toString()}
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
            defaultSortingPriority: 2,
        },
    ],
}

export default sns

function onAttachedFile() {
    return 'Trader XYZ NFR Attached'
}
