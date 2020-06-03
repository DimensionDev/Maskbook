import { useMediaDevices } from 'react-use'

interface Device {
    deviceId: string
    groupId: string
    kind: 'audioinput' | 'videoinput'
    label: string
}

export function useVideoDevices() {
    const { devices = [] } = useMediaDevices() as {
        devices: Device[]
    }
    return devices.filter((d) => d.kind === 'videoinput') as Device[]
}
