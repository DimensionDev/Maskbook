import { useEffect } from 'react'
import Services from '../../extension/service'
import { MessageCenter } from '../../utils/messages'
import useSWR from 'swr'

export function useExtensionPermission(host: browser.permissions.Permissions) {
    const { data, revalidate } = useSWR(JSON.stringify(host), {
        fetcher(host: string) {
            return Services.Welcome.queryPermission(JSON.parse(host))
        },
        initialData: false,
        suspense: true,
    })
    useEffect(() => MessageCenter.on('permissionUpdated', revalidate), [revalidate])
    return {
        hasPermission: data!,
        request: () => {
            const _ = new URLSearchParams()
            host.origins?.forEach((x) => _.append('origin', x))
            Services.Welcome.openOptionsPage('request-permission?' + _.toString())
        },
    }
}
