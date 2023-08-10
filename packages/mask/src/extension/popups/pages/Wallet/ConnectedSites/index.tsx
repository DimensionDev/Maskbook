import { memo } from 'react'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
const ConnectedSites = memo(function ConnectedSites() {
    const { t } = useI18N()
    useTitle(t('popups_wallet_connected_sites'))
    return <></>
})

export default ConnectedSites
