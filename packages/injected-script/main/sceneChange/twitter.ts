import { TWITTER_RESERVED_SLUGS } from '../../shared/index.js'
import { $, $Content } from '../intrinsic.js'

function getFirstSlug() {
    const slugs: string[] = $.ArrayFilter($.StringSplit(location.pathname, '/' as any), $.Boolean)
    return slugs[0]
}

export function setupWatcherForTwitter() {
    let firstSlug = ''
    const update = () => {
        const newFirstSlug = getFirstSlug()
        // reset to void wrong value
        if (!newFirstSlug || $.ArrayIncludes(TWITTER_RESERVED_SLUGS, newFirstSlug)) {
            const event = new $Content.CustomEvent('scenechange', {
                detail: { scene: 'unknown' },
            }) as WindowEventMap['scenechange']
            $Content.dispatchEvent(window, event)
            return
        }
        if (firstSlug !== newFirstSlug) {
            firstSlug = newFirstSlug
            const event = new $Content.CustomEvent('scenechange', {
                cancelable: true,
                detail: {
                    scene: 'profile',
                    value: newFirstSlug,
                },
            })
            $Content.dispatchEvent(window, event)
        }
    }
    window.addEventListener('locationchange', update)
}
