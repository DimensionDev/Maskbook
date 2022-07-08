import { TWITTER_RESERVED_SLUGS } from '../../shared'
import { apply, dispatchEvent, no_xray_CustomEvent } from '../intrinsic'

const { split } = String.prototype
const { filter, includes } = Array.prototype
const { Boolean } = globalThis

function getFirstSlug() {
    const slugs: string[] = apply(filter, apply(split, location.pathname, ['/' as any]), [Boolean])
    return slugs[0]
}

export function setupWatcherForTwitter() {
    let firstSlug = ''
    const update = () => {
        const newFirstSlug = getFirstSlug()
        // reset to void wrong value
        if (!firstSlug || apply(includes, TWITTER_RESERVED_SLUGS, [firstSlug])) {
            const event = new no_xray_CustomEvent('scenechange', {
                detail: { scene: 'unknown' },
            }) as WindowEventMap['scenechange']
            apply(dispatchEvent, window, [event])
            return
        }
        if (firstSlug !== newFirstSlug) {
            firstSlug = newFirstSlug
            const event = new no_xray_CustomEvent('scenechange', {
                cancelable: true,
                detail: {
                    scene: 'profile',
                    value: newFirstSlug,
                },
            })
            apply(dispatchEvent, window, [event])
        }
    }
    window.addEventListener('locationchange', update)
}
