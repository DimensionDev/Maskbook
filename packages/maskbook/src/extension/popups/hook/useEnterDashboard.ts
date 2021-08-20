import { useCallback } from 'react'

export const useEnterDashboard = () => {
    return useCallback((event: React.MouseEvent) => {
        if (event.shiftKey) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/debug.html'),
            })
        } else if (process.env.NODE_ENV === 'development' && event.ctrlKey) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/next.html'),
            })
        } else {
            browser.runtime.openOptionsPage()
        }
    }, [])
}
