import { CrossIsolationMessages } from '@masknet/shared-base'
import { makeTypedMessageText } from '@masknet/typed-message'

export function openComposition(
    metadataKey: string,
    payload: unknown,
    reason: 'popup' | 'timeline' = 'timeline',
    extraMeta?: unknown,
    content?: string,
) {
    // Close the duplicated dialog if already opened by clicking the mask compose icon.
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({ reason: 'popup', open: false })
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
        reason,
        open: true,
        content: content ? makeTypedMessageText(content) : undefined,
        options: {
            initialMeta: {
                [metadataKey]: payload,
            },
            pluginMeta: extraMeta,
        },
    })
}
