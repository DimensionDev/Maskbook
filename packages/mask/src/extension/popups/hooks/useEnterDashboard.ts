// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { useCallback } from 'react'

export const useEnterDashboard = () => {
    return useCallback((event: React.MouseEvent) => {
        if (event.shiftKey) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/debug.html'),
            })
        } else {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/dashboard.html'),
            })
        }
    }, [])
}
