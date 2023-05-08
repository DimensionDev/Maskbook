export const isDashboardPage = location.protocol.includes('extension') && location.href.includes('dashboard.html')

export const isPopupPage = location.protocol.includes('extension') && location.href.includes('popups.html')
