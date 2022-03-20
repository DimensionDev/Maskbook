import { ThirdPartyPluginPermission } from '../../background-script/ThirdPartyPlugin/types'
import { useI18N } from '../../../utils'
import { Trans } from 'react-i18next'
export interface ThirdPartyRequestPermissionProps {
    pluginURL: string
    pluginName: string
    permissions: ThirdPartyPluginPermission[]
    onGrant(permissions: ThirdPartyPluginPermission[]): void
}
export function ThirdPartyRequestPermission(props: ThirdPartyRequestPermissionProps) {
    const { t } = useI18N()
    return (
        <main>
            <Trans
                i18nKey="popups_following_permissions"
                values={{ pluginName: props.pluginName, pluginURL: props.pluginURL }}
            />
            <ul>
                {props.permissions.map((x) => (
                    <li key={x}>{ThirdPartyPluginPermission[x]}</li>
                ))}
            </ul>
            <button onClick={() => window.close()}>{t('cancel')}</button>
            <button onClick={() => props.onGrant(props.permissions)}>{t('popups_grant')}</button>
        </main>
    )
}
