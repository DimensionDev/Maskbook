export function isDashboardPage() {
    return location.protocol.includes('extension') && location.href.includes('dashboard.html')
}
