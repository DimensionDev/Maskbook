/** This file is published under MIT License */
import { useEffect, useState } from 'react'
import { hasIn } from 'lodash-es'

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

export function useRequestCamera(needRequest: boolean) {
    const [permission, updatePermission] = useState<PermissionState>('prompt')

    useEffect(() => {
        if (!needRequest || permission !== 'prompt') return
        let permissionStatus: PermissionStatus

        if (checkPermissionApiUsability('query')) {
            navigator.permissions
                .query({ name: 'camera' })
                .then(p => {
                    permissionStatus = p
                    permissionStatus.onchange = () => {
                        updatePermission(permissionStatus.state)
                    }
                    updatePermission(permissionStatus.state)
                })
                .catch(e => {
                    // for some user agents which implemented `query` method
                    // but rise an error if specific permission name dose not supported
                    updatePermission('granted')
                })
        } else if (checkPermissionApiUsability('request')) {
            navigator.permissions
                .request({ name: 'camera' })
                .then(p => {
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
    }, [needRequest, permission])
    return permission
}

export async function getBackVideoDeviceId() {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter(devices => devices.kind === 'videoinput')
    const back = devices.find(
        device =>
            (device.label.toLowerCase().search('back') !== -1 || device.label.toLowerCase().search('rear') !== -1) &&
            device.label.toLowerCase().search('front') === -1,
    )
    if (back) return back.deviceId
    if (devices[0]) return devices[0].deviceId
    return null
}
