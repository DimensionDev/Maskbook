// ! We're going to SSR this UI, so DO NOT import anything new!
import { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { useEnterDashboard } from '../../hook/useEnterDashboard'
import { useI18N } from '../../../../utils/i18n-next-ui'

export const EnterDashboard = memo(() => {
    const { t } = useI18N()
    const onEnter = useEnterDashboard()

    return (
        <Box
            style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                width: '100%',
                position: 'fixed',
                bottom: 0,
            }}
            onClick={onEnter}>
            <Typography style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600 }} color="primary">
                {t('browser_action_enter_dashboard')}
            </Typography>
        </Box>
    )
})
