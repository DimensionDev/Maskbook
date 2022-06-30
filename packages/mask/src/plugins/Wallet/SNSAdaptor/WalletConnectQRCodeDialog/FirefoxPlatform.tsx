import { Button } from '@mui/material'
import { useI18N } from '../../../../utils'

export const FirefoxPlatform: React.FC<{ uri: string }> = ({ uri }) => {
    const { t } = useI18N()
    return <Button onClick={() => open(uri)}>{t('plugin_wallet_on_connect_in_firefox')}</Button>
}
