import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { useLocation } from 'react-router-dom'
import { parseURL } from '@masknet/shared-base'
import { MissingParameter } from '../MissingParameter/index.js'
import { PermissionAwareRedirectUI } from './ui.js'
import { getHostPermissionFieldFromURL, isValidURL } from './utils.js'

export { PermissionAwareRedirectUI } from './ui.js'
export default function PermissionAwareRedirect() {
    const url = new URLSearchParams(useLocation().search).get('url')
    const context = new URLSearchParams(useLocation().search).get('context')
    if (!url) return <MissingParameter message="Parameter URL not found." />
    if (!context) return <MissingParameter message="Parameter context not found." />
    if (!isValidURL(url)) return <MissingParameter message="Parameter URL is not valid." />
    return <Inner url={url} context={context} />
}
function Inner({ url, context }: { url: string; context: string }) {
    const { value: hasPermission, retry } = useAsyncRetry(async () => {
        if (!url) return false
        return browser.permissions.contains({ origins: [getHostPermissionFieldFromURL(url)] })
    }, [url])
    useEffect(() => {
        if (!hasPermission) return
        const parsed = parseURL(url)
        if (!parsed) return
        parsed.searchParams.append('mask_context', context)
        location.assign(parsed.toString())
    }, [hasPermission, url])
    return (
        <PermissionAwareRedirectUI
            url={url}
            granted={!!hasPermission}
            onCancel={() => window.close()}
            onRequest={() => {
                browser.permissions.request({ origins: [getHostPermissionFieldFromURL(url)] }).finally(retry)
            }}
        />
    )
}
