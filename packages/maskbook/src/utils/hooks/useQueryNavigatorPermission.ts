/** This file is published under MIT License */
import { useEffect, useState } from 'react'
import { hasIn } from 'lodash-es'
import { Flags } from '../flags'

const q = <const>['query', 'request', 'revoke']

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

export function useQueryNavigatorPermission(needRequest: boolean, name: PermissionNameWithClipboard): PermissionState {
    const [permission, updatePermission] = useState<PermissionState>('prompt')

    useEffect(() => {
        // TODO: Only camera related APi need to check Flags.has_no_WebRTC
        if (!needRequest || permission !== 'prompt' || Flags.has_no_WebRTC) return
        let permissionStatus: PermissionStatus

        if (checkPermissionApiUsability('query')) {
            navigator.permissions
                .query({ name })
                .then((p) => {
                    permissionStatus = p
                    permissionStatus.onchange = () => {
                        updatePermission(permissionStatus.state)
                    }
                    updatePermission(permissionStatus.state)
                })
                .catch((e) => {
                    // for some user agents which implemented `query` method
                    // but rise an error if specific permission name dose not supported
                    updatePermission('granted')
                })
        } else if (checkPermissionApiUsability('request')) {
            navigator.permissions
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
        return () => {
            if (permissionStatus) permissionStatus.onchange = null
        }
    }, [name, needRequest, permission])
    return permission
}
