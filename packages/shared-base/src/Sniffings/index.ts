import { isDomainOrSubdomainOf } from '../helpers/domain-test.js'

const navigator_: Navigator | undefined = globalThis.navigator as any
const location_: Location | undefined = globalThis.location as any

const isChromium = navigator_?.userAgent.includes('Chrome') || navigator_?.userAgent.includes('Chromium')
const extensionProtocol = location_?.protocol.includes('extension')

export const Sniffings = {
    is_dashboard_page: extensionProtocol && location_?.href.includes('dashboard.html'),
    is_popup_page: extensionProtocol && location_?.href.includes('popups.html'),
    is_swap_page: extensionProtocol && location_?.href.includes('swap.html'),

    is_twitter_page:
        location_ ?
            isDomainOrSubdomainOf(location_.href, 'twitter.com') || isDomainOrSubdomainOf(location_.href, 'x.com')
        :   false,

    is_facebook_page: location_ ? isDomainOrSubdomainOf(location_?.href, 'facebook.com') : false,

    is_opera: navigator_?.userAgent.includes('OPR/'),
    is_edge: navigator_?.userAgent.includes('Edg'),
    is_firefox: navigator_?.userAgent.includes('Firefox'),
    is_chromium: isChromium,
    is_safari: !isChromium && navigator_?.userAgent.includes('Safari'),
}
