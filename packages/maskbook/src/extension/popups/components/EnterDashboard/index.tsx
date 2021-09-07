import { memo } from 'react'
import { Box, Typography } from '@material-ui/core'
import { useEnterDashboard } from '../../hook/useEnterDashboard'
import { useI18N } from '../../../../utils'

export const EnterDashboard = memo(() => {
    const { t } = useI18N()
    const onEnter = useEnterDashboard()

    return (
        <Box style={{ padding: '12px 16px', cursor: 'pointer', backgroundColor: '#ffffff' }} onClick={onEnter}>
            <Typography style={{ fontSize: 12, lineHeight: '16px' }} color="primary">
                {t('browser_action_enter_dashboard')}
            </Typography>
        </Box>
    )
})
