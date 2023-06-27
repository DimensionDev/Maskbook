import { memo } from 'react'
import { BottomDrawer } from '../../components/BottomDrawer/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import type { EnhanceableSite } from '@masknet/shared-base'
import { ConnectSocialAccounts } from '../../components/ConnectSocialAccounts/index.js'
import { noop } from 'lodash-es'
import { Box } from '@mui/material'

interface ConnectSocialAccountDialog {
    open: boolean
    onClose: () => void
    networks: EnhanceableSite[]
    onConnect?: (networkIdentifier: EnhanceableSite) => void
}

export const ConnectSocialAccountDialog = memo<ConnectSocialAccountDialog>(function ConnectSocialAccountDialog({
    open,
    onClose,
    networks,
    onConnect,
}) {
    const { t } = useI18N()

    return (
        <BottomDrawer open={open} onClose={onClose} title={t('popups_connect_social_account')}>
            <Box pt={2}>
                <ConnectSocialAccounts networks={networks} onConnect={onConnect ?? noop} />
            </Box>
        </BottomDrawer>
    )
})
