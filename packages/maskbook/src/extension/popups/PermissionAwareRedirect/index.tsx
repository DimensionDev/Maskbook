export { PermissionAwareRedirectUI } from './ui'

import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useAsync } from 'react-use'
import { MissingParameter } from '../MissingParameter'
import { PermissionAwareRedirectUI } from './ui'
import { getHostPermissionFieldFromURL, isValidURL } from './utils'
export default function PermissionAwareRedirect() {
    const url = new URLSearchParams(useLocation().search).get('url')
    if (!url) return <MissingParameter message="Parameter URL not found." />
    if (!isValidURL(url)) return <MissingParameter message="Parameter URL is not valid." />
    return <Inner url={url} />
}
function Inner({ url }: { url: string }) {
    const { value: hasPermission } = useAsync(async () => {
        if (!url) return false
        return browser.permissions.contains({ origins: [getHostPermissionFieldFromURL(url)] })
    }, [url])
    useEffect(() => {
        if (hasPermission) {
            location.href = url
        }
    }, [hasPermission, url])
    return (
        <PermissionAwareRedirectUI
            url={url}
            granted={!!hasPermission}
            onRequest={() => {
                browser.permissions.request({ origins: [getHostPermissionFieldFromURL(url)] })
            }}
        />
    )
}
