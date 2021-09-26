import type { EventBasedChannel } from 'async-call-rpc'

const EVENT_UserScript = '@masknet/sdk-raw/us'
const EVENT_ContentScript = '@masknet/sdk-raw/cs'
export function createMaskSDKChannel(side: 'user' | 'content'): EventBasedChannel {
    const thisSide = side === 'content' ? EVENT_ContentScript : EVENT_UserScript
    const otherSide = side === 'content' ? EVENT_UserScript : EVENT_ContentScript
    return {
        on(callback) {
            const f = (e: Event) => {
                if (e instanceof CustomEvent) callback(e.detail)
            }
            document.addEventListener(thisSide, f)
            return () => document.removeEventListener(thisSide, f)
        },
        send(data) {
            document.dispatchEvent(new CustomEvent(otherSide, { detail: data }))
        },
    }
}
