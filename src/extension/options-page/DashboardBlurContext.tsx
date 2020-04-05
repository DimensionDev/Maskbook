import React, { useContext, useEffect } from 'react'
const DashboardBlurContext = React.createContext<{
    blur(): void
    unblur(): void
}>(null!)
export const DashboardBlurContextProvider = DashboardBlurContext.Provider

export function useBlurContext(open: boolean) {
    const context = useContext(DashboardBlurContext)
    useEffect(() => (open ? context.blur() : context.unblur()), [context, open])
}
