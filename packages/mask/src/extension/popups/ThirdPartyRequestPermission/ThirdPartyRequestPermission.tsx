import { Trans } from 'react-i18next'
import { useI18N } from '../../../utils/index.js'
import { ThirdPartyPluginPermission } from '../../../../shared/definitions/routes.js'

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
                {props.permissions.map((permission, key) => (
                    <li key={key}>{ThirdPartyPluginPermission[permission]}</li>
                ))}
            </ul>
            <button type="button" onClick={() => window.close()}>
                {t('cancel')}
            </button>
            <button type="button" onClick={() => props.onGrant(props.permissions)}>
                {t('popups_grant')}
            </button>
        </main>
    )
}
