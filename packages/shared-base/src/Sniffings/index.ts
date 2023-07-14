enum SiteHost {
    Twitter = 'twitter.com',
    Facebook = 'facebook.com',
}

const isChromium =
    typeof navigator === 'object' &&
    (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Chromium'))

export const Sniffings = {
    is_dashboard_page:
        typeof location === 'object' &&
        location.protocol.includes('extension') &&
        location.href.includes('dashboard.html'),
    is_popup_page:
        typeof location === 'object' &&
        location.protocol.includes('extension') &&
        location.href.includes('popups.html'),
    is_popup_wallet_page:
        typeof location === 'object' &&
        location.protocol.includes('extension') &&
        location.href.includes('popups.html') &&
        location.href.includes('/wallet'),

    is_twitter_page: typeof location === 'object' && location.href.includes(SiteHost.Twitter),
    is_facebook_page: typeof location === 'object' && location.href.includes(SiteHost.Facebook),

    is_opera: typeof navigator === 'object' && navigator.userAgent.includes('OPR/'),
    is_edge: typeof navigator === 'object' && navigator.userAgent.includes('Edg'),
    is_firefox: typeof navigator === 'object' && navigator.userAgent.includes('Firefox'),
    is_chromium: isChromium,
    is_safari: !isChromium && navigator.userAgent.includes('Safari'),
}
