import { TWITTER_RESERVED_SLUGS } from '../../shared'
import { $, $NoXRay } from '../intrinsic'

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
            const event = new $NoXRay.CustomEvent('scenechange', {
                detail: { scene: 'unknown' },
            }) as WindowEventMap['scenechange']
            $NoXRay.dispatchEvent(window, event)
            return
        }
        if (firstSlug !== newFirstSlug) {
            firstSlug = newFirstSlug
            const event = new $NoXRay.CustomEvent('scenechange', {
                cancelable: true,
                detail: {
                    scene: 'profile',
                    value: newFirstSlug,
                },
            })
            $NoXRay.dispatchEvent(window, event)
        }
    }
    window.addEventListener('locationchange', update)
}
