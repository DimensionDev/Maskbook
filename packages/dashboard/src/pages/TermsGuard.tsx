import { type FC, type PropsWithChildren, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { TermsAgreedContext } from '../hooks/useTermsAgreed.js'

const TermsGuardInner: FC<PropsWithChildren<{}>> = ({ children }) => {
    const navigate = useNavigate()
    const [agreed] = TermsAgreedContext.useContainer()
    const { pathname, search } = useLocation()

    const noNeedToNavigate = agreed || pathname === DashboardRoutes.Welcome
    useEffect(() => {
        if (noNeedToNavigate) return
        const url = urlcat(DashboardRoutes.Welcome, {
            from: pathname || undefined,
            search: pathname && search ? search : undefined,
        })
        navigate(url, {
            replace: true,
        })
    }, [noNeedToNavigate, search, navigate])

    return <>{children}</>
}

export const TermsGuard: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <TermsAgreedContext.Provider>
            <TermsGuardInner>{children}</TermsGuardInner>
        </TermsAgreedContext.Provider>
    )
}
