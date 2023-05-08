export const sniffings = {
    is_dashboard_page: location.protocol.includes('extension') && location.href.includes('dashboard.html'),
    is_popup_page: location.protocol.includes('extension') && location.href.includes('popups.html'),

    is_twitter_page: location.href.includes('twitter.com'),
    is_facebook_page: location.href.includes('facebook.com'),

    is_opera: navigator.userAgent.includes('OPR/'),
    is_edge: navigator.userAgent.includes('Edg'),
    is_firefox: process.env.engine === 'firefox',
    is_chromium: process.env.engine === 'chromium',
}
