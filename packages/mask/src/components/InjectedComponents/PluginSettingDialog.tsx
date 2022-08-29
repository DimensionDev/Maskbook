import { useI18N } from '../../utils'
import { InjectedDialog } from '@masknet/shared'
export function PluginSettingDialog() {
    const { t } = useI18N()

    return (
        <InjectedDialog open={false} title={t('settings')}>
            test
        </InjectedDialog>
    )
}
