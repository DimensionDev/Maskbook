import type { FC, PropsWithChildren } from 'react'
import { styled } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { DashboardRoutes } from '@masknet/shared-base'
import { LoadingBase } from '@masknet/theme'
import { Services } from '../API.js'
import urlcat from 'urlcat'

function useLogGuard() {
    const navigate = useNavigate()
    const { pathname, search } = useLocation()

    const result = useAsync(async () => {
        const response = await Services.Settings.getLogSettings()
        if (!response && pathname !== DashboardRoutes.Welcome) {
            const url = urlcat(DashboardRoutes.Welcome, {
                from: pathname || undefined,
                search: pathname && search ? search : undefined,
            })
            navigate(url, {
                replace: true,
            })
            return
        }
        return response
    }, [navigate, pathname, search])

    return result
}

const Overlay = styled('div')({
    position: 'fixed',
    inset: 0,
    margin: 'auto',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
})
export const LogGuard: FC<PropsWithChildren<{}>> = ({ children }) => {
    const { loading: checking } = useLogGuard()

    if (checking)
        return (
            <Overlay>
                <LoadingBase size={64} />
            </Overlay>
        )
    return <>{children}</>
}
