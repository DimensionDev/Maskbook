import { Box } from '@material-ui/core'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAsyncRetry } from 'react-use'
import { RequestPermission } from './RequestPermission'

const acceptable: readonly browser.permissions.Permission[] = [
    'alarms',
    'clipboardRead',
    'clipboardWrite',
    'contextMenus',
    'contextualIdentities',
    'menus',
    'notifications',
    'webRequestBlocking',
]
function isAcceptablePermission(x: string): x is browser.permissions.Permission {
    return (acceptable as string[]).includes(x)
}

export default function RequestPermissionPage() {
    const param = useLocation()
    const _ = new URLSearchParams(param.search)
    const origins = _.getAll('origins')
    const permissions = _.getAll('permissions').filter(isAcceptablePermission)

    const { retry, value: hasPermission } = useAsyncRetry(
        () => browser.permissions.contains({ origins, permissions }),
        [param.search],
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
