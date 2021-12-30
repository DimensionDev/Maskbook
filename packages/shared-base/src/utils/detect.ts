export function isPopupPage() {
    return location.protocol.includes('extension') && location.href.includes('popups.html')
}

export function isDashboardPage() {
    return location.protocol.includes('extension') && location.href.includes('dashboard.html')
}
