import { TWITTER_RESERVED_SLUGS } from '../../shared/index.js'
import { $ } from '../intrinsic.js'
import { isTwitter } from '../utils.js'

function getFirstSlug() {
    const slugs: string[] = $.ArrayFilter($.StringSplit(location.pathname, '/' as any), $.Boolean)
    return slugs[0]
}

let firstSlug = ''
function update() {
    const newFirstSlug = getFirstSlug()
    // reset to void wrong value
    if (!newFirstSlug || $.ArrayIncludes(TWITTER_RESERVED_SLUGS, newFirstSlug)) {
        const event: WindowEventMap['scenechange'] = new $.CustomEvent('scenechange', {
            __proto__: null,
            detail: {
                __proto__: null,
                scene: 'unknown',
            },
        })
        $.dispatchEvent(window, event)
        return
    }
    if (firstSlug !== newFirstSlug) {
        firstSlug = newFirstSlug
        const event = new $.CustomEvent('scenechange', {
            __proto__: null,
            detail: {
                __proto__: null,
                scene: 'profile',
                value: newFirstSlug,
            },
        })
        $.dispatchEvent(window, event)
    }
}
if (isTwitter()) {
    window.addEventListener('locationchange', update)
}
