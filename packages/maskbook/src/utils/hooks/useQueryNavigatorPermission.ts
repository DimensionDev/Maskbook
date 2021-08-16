/** This file is published under MIT License */
import { useEffect, useState } from 'react'
import { hasIn } from 'lodash-es'
import { Flags } from '../flags'

const q = ['query', 'request', 'revoke'] as const

export function checkPermissionApiUsability(type?: typeof q[number]) {
    const r: Partial<{ [T in typeof q[number]]: boolean }> = {}
    for (const v of q) {
        r[v] = hasIn(navigator, `permissions.${v}`)
    }
    if (type) {
        return r[type]
    }
    return r as Required<typeof r>
}

// TODO: 'clipboard-write' is not listed in https://w3c.github.io/permissions/#enumdef-permissionname
// We should make sure if those code are still working.
export type Permissions = PermissionName | 'camera' | 'clipboard-write'

export function useQueryNavigatorPermission(needRequest: boolean, name: Permissions): PermissionState {
    const [permission, updatePermission] = useState<PermissionState>('prompt')

    useEffect(() => {
        // TODO: Only camera related APi need to check Flags.has_no_WebRTC
        if (!needRequest || permission !== 'prompt' || Flags.has_no_WebRTC) return
        let permissionStatus: PermissionStatus

        const handleChange = function (this: PermissionStatus) {
            updatePermission(this.state)
        }

        if (checkPermissionApiUsability('query')) {
            navigator.permissions
                // @ts-expect-error https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1029#issuecomment-898868275
                .query({ name })
                .then((p) => {
                    permissionStatus = p
                    permissionStatus.addEventListener('change', handleChange)
                    updatePermission(permissionStatus.state)
                })
                .catch(() => {
                    // for some user agents which implemented `query` method
                    // but rise an error if specific permission name dose not supported
                    updatePermission('granted')
                })
        } else if (checkPermissionApiUsability('request')) {
            navigator.permissions
                // @ts-expect-error https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1029#issuecomment-898868275
                .request({ name })
                .then((p) => {
                    updatePermission(p.state)
                })
                .catch(() => {
                    updatePermission('granted')
                })
        } else {
            updatePermission('granted')
        }
        return () => permissionStatus?.removeEventListener('change', handleChange)
    }, [name, needRequest, permission])
    return permission
}
