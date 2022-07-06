import { apply, dispatchEvent, no_xray_CustomEvent } from '../intrinsic'

// Collect from main js of Twitter's web client.
const RESERVED_SLUGS = [
    '404',
    'account',
    'download',
    'explore',
    'follower_requests',
    'hashtag',
    'home',
    'i',
    'intent',
    'lists',
    'login',
    'logout',
    'mentions',
    'messages',
    'notifications',
    'personalization',
    'search',
    'search-advanced',
    'search-home',
    'session',
    'settings',
    'share',
    'signup',
    'twitterblue',
    'webview',
    'welcome',
    'your_twitter_data',
]

const getFirstSlug = () => {
    const slugs = location.pathname.split('/').filter((x) => x)
    return slugs[0]
}

export function setupWatcherForTwitter() {
    let firstSlug = getFirstSlug()
    window.addEventListener('locationchange', () => {
        const newFirstSlug = getFirstSlug()
        // reset to void wrong value
        if (!firstSlug || RESERVED_SLUGS.includes(firstSlug)) {
            const event = new no_xray_CustomEvent('scenechange', {
                detail: { scene: 'unknown' },
            }) as WindowEventMap['scenechange']
            apply(dispatchEvent, window, [event])
            return
        }
        if (firstSlug !== newFirstSlug) {
            firstSlug = newFirstSlug
            const event = new no_xray_CustomEvent('scenechange', {
                detail: {
                    scene: 'profile',
                    value: newFirstSlug,
                },
            })
            apply(dispatchEvent, window, [event])
        }
    })
}
