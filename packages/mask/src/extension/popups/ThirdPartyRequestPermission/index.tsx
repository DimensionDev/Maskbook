import { useLocation } from 'react-router-dom'
import { useAsync } from 'react-use'
import Services from '../../service.js'
import { ThirdPartyRequestPermission } from './ThirdPartyRequestPermission.js'

export default function () {
    const param = useLocation()
    const _ = new URLSearchParams(param.search)
    const permission = _.getAll('permission')
    const plugin = _.get('plugin')
    const { value } = useAsync(() => Services.ThirdPartyPlugin.fetchManifest(plugin!), [plugin])
    if (!plugin) return null
    if (!value) return null
    return (
        <ThirdPartyRequestPermission
            pluginURL={plugin}
            pluginName={value.name}
            permissions={permission.map((x) => Number.parseInt(x, 10))}
            onGrant={(granted) => {
                Services.ThirdPartyPlugin.grantPermission(plugin, granted).then(() => window.close())
            }}
        />
    )
}
