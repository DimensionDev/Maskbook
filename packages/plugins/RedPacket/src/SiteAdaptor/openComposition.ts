import { CrossIsolationMessages } from '@masknet/shared-base'

export function openComposition(
    metadataKey: string,
    payload: unknown,
    reason: 'popup' | 'timeline' = 'timeline',
    extraMeta?: unknown,
) {
    // Close the duplicated dialog if already opened by clicking the mask compose icon.
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({ reason: 'popup', open: false })
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
        reason,
        open: true,
        options: {
            initialMeta: {
                [metadataKey]: payload,
            },
            pluginMeta: extraMeta,
        },
    })
}
