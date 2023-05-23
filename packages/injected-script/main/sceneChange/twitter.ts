import { TWITTER_RESERVED_SLUGS } from '../../shared/index.js'
import { $, $Blessed, $Content } from '../intrinsic.js'
import { isTwitter } from '../utils.js'

$.setPrototypeOf(TWITTER_RESERVED_SLUGS, $Blessed.ArrayPrototype)
function getFirstSlug() {
    const slugs: string[] = $.ArrayFilter($.StringSplit(location.pathname, '/' as any), $.Boolean)
    return slugs[0]
}

let firstSlug = ''
function update() {
    const newFirstSlug = getFirstSlug()
    // reset to void wrong value
    if (!newFirstSlug || TWITTER_RESERVED_SLUGS.includes(newFirstSlug)) {
        const event: WindowEventMap['scenechange'] = new $Content.CustomEvent('scenechange', {
            // @ts-expect-error null prototype
            __proto__: null,
            detail: {
                __proto__: null,
                scene: 'unknown',
            },
        })
        $Content.dispatchEvent(window, event)
        return
    }
    if (firstSlug !== newFirstSlug) {
        firstSlug = newFirstSlug
        const event = new $Content.CustomEvent('scenechange', {
            // @ts-expect-error null prototype
            __proto__: null,
            detail: {
                __proto__: null,
                scene: 'profile',
                value: newFirstSlug,
            },
        })
        $Content.dispatchEvent(window, event)
    }
}
if (isTwitter()) {
    window.addEventListener('locationchange', update)
}
