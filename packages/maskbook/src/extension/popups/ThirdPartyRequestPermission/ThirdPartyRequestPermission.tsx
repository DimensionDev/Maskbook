import { ThirdPartyPluginPermission } from '../../background-script/ThirdPartyPlugin/types'

export interface ThirdPartyRequestPermissionProps {
    pluginURL: string
    pluginName: string
    permissions: ThirdPartyPluginPermission[]
    onGrant(permissions: ThirdPartyPluginPermission[]): void
}
export function ThirdPartyRequestPermission(props: ThirdPartyRequestPermissionProps) {
    return (
        <main>
            The plugin "{props.pluginName}" (hosted on {props.pluginURL}) is going to request the following permissions:
            <ul>
                {props.permissions.map((x) => (
                    <li key={x}>{ThirdPartyPluginPermission[x]}</li>
                ))}
            </ul>
            <button onClick={() => window.close()}>Cancel</button>
            <button onClick={() => props.onGrant(props.permissions)}>Grant</button>
        </main>
    )
}
