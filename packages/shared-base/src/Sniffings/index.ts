enum SiteHost {
    Twitter = 'twitter.com',
    Facebook = 'facebook.com',
}

const navigator_ = process.env.NODE_ENV === 'test' ? null : navigator
const location_ = process.env.NODE_ENV === 'test' ? null : location

const isChromium = navigator_?.userAgent.includes('Chrome') || navigator_?.userAgent.includes('Chromium')

export const Sniffings = {
    is_dashboard_page: location_?.protocol.includes('extension') && location_.href.includes('dashboard.html'),
    is_popup_page: location_?.protocol.includes('extension') && location_.href.includes('popups.html'),

    is_twitter_page: location_?.href.includes(SiteHost.Twitter),
    is_facebook_page: location_?.href.includes(SiteHost.Facebook),

    is_opera: navigator_?.userAgent.includes('OPR/'),
    is_edge: navigator_?.userAgent.includes('Edg'),
    is_firefox: navigator_?.userAgent.includes('Firefox'),
    is_chromium: isChromium,
    is_safari: !isChromium && navigator_?.userAgent.includes('Safari'),
}
