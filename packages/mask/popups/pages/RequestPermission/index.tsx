import { Box } from '@mui/material'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAsyncRetry } from 'react-use'
import { RequestPermission } from './RequestPermission.js'
import type { Manifest } from 'webextension-polyfill'

const CanRequestDynamically: readonly Manifest.OptionalPermission[] = [
    'clipboardRead',
    'clipboardWrite',
    'notifications',
    'webRequestBlocking',
]
function canRequestDynamically(x: string): x is Manifest.OptionalPermission {
    return (CanRequestDynamically as string[]).includes(x)
}

export { RequestPermissionPage as Component }
export function RequestPermissionPage() {
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const origins = params.getAll('origins')
    const permissions = params.getAll('permissions').filter(canRequestDynamically)

    const { retry, value: hasPermission } = useAsyncRetry(
        () => browser.permissions.contains({ origins, permissions }),
        [location.search],
    )

    useEffect(() => {
        if (hasPermission) window.close()
    }, [hasPermission])
    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}>
            <RequestPermission
                onCancel={() => window.close()}
                onRequestApprove={() => browser.permissions.request({ origins, permissions }).finally(retry)}
                origins={origins}
                permissions={permissions}
            />
        </Box>
    )
}
