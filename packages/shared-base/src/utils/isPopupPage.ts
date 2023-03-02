export function isPopupPage() {
    return location.protocol.includes('extension') && location.href.includes('popups.html')
}
