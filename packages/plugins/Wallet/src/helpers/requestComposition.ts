import { MaskMessages } from '../messages'
export function requestComposition(startupPlugin: string) {
    MaskMessages.events.requestComposition.sendToLocal({
        reason: 'timeline',
        open: true,
        options: {
            startupPlugin,
        },
    })
}
