import { CrossIsolationMessages } from '@masknet/shared-base'

export function openComposition(metadataKey: string, payload: unknown) {
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
        reason: 'timeline',
        open: true,
        options: {
            initialMetas: {
                [metadataKey]: payload,
            },
        },
    })
}
