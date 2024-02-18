import { CrossIsolationMessages } from '@masknet/shared-base'

<<<<<<< HEAD
export function openComposition(metadataKey: string, payload: unknown, extraMeta?: unknown) {
=======
export function openComposition(metadataKey: string, payload: unknown, reason: 'popup' | 'timeline' = 'timeline') {
>>>>>>> develop
    // Close the duplicated dialog if already opened by clicking the mask compose icon.
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({ reason: 'popup', open: false })
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
        reason,
        open: true,
        options: {
            initialMetas: {
                [metadataKey]: payload,
            },
            pluginMeta: extraMeta,
        },
    })
}
