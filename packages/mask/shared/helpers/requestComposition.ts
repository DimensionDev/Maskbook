import { CrossIsolationMessages } from '@masknet/shared-base'
export function requestComposition(startupPlugin: string) {
    CrossIsolationMessages.events.requestComposition.sendToLocal({
        reason: 'timeline',
        open: true,
        options: {
            startupPlugin,
        },
    })
}
