enum SiteType {
    Twitter = 'twitter.com',
    Facebook = 'facebook.com',
}

const isChromium = navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Chromium')
export const Sniffings = {
    is_dashboard_page: location.protocol.includes('extension') && location.href.includes('dashboard.html'),
    is_popup_page: location.protocol.includes('extension') && location.href.includes('popups.html'),

    is_twitter_page: location.href.includes(SiteType.Twitter),
    is_facebook_page: location.href.includes(SiteType.Facebook),

    is_opera: navigator.userAgent.includes('OPR/'),
    is_edge: navigator.userAgent.includes('Edg'),
    is_firefox: navigator.userAgent.includes('Firefox'),
    is_chromium: isChromium,
    is_safari: !isChromium && navigator.userAgent.includes('Safari'),
}
