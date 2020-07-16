import { useMediaDevices, usePermission } from 'react-use'
import { useEffect } from 'react'

export interface Device {
    deviceId: string
    groupId: string
    kind: 'audioinput' | 'videoinput'
    label: string
}

export function useVideoDevices() {
    const permissionState = usePermission({ name: 'camera' })
    const { devices = [] } = useMediaDevices() as {
        devices: Device[]
    }
    // we dispatch a fake event if permission changed
    // in order to fix the bug described in this issues
    // https://github.com/streamich/react-use/issues/1318
    useEffect(() => {
        navigator.mediaDevices.dispatchEvent(new Event('devicechange'))
    }, [permissionState])
    return devices.filter((d) => d.kind === 'videoinput') as Device[]
}
