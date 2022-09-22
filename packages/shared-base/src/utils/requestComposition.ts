import { CrossIsolationMessages } from '@masknet/shared-base'
export function requestComposition(startupPlugin: string) {
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
        reason: 'timeline',
        open: true,
        options: {
            startupPlugin,
        },
    })
}
