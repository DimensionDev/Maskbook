import { twitterDomainMigrate } from '@masknet/shared-base'
import { openWindow } from '../bom/open-window.js'
import urlcat from 'urlcat'

export function shareToTwitterAsPopup(message: string) {
    const url = twitterDomainMigrate(urlcat('https://x.com/intent/tweet', { text: message }))
    const width = 700
    const height = 520
    const openedWindow = openWindow(url, 'share', {
        width,
        height,
        screenX: window.screenX + (window.innerWidth - width) / 2,
        screenY: window.screenY + (window.innerHeight - height) / 2,
        opener: true,
        referrer: true,
        behaviors: {
            toolbar: true,
            status: true,
            resizable: true,
            scrollbars: true,
        },
    })
    if (openedWindow === null) {
        location.assign(url)
    }
}
