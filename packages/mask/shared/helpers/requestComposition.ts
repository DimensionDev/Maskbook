import { MaskMessages } from '@masknet/plugin-wallet'
export function requestComposition(startupPlugin: string) {
    MaskMessages.events.requestComposition.sendToLocal({
        reason: 'timeline',
        open: true,
        options: {
            startupPlugin,
        },
    })
}
