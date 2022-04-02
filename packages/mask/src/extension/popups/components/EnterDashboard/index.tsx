// ! This file is used during SSR. DO NOT import new files that does not work in SSR
import { memo } from 'react'
import { styled, Typography } from '@mui/material'
import { useEnterDashboard } from '../../hook/useEnterDashboard'
import { useI18N } from '../../../../utils/i18n-next-ui'

const Button = styled('a')({
    padding: '12px 16px',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    width: '100%',
    position: 'fixed',
    bottom: 0,
    textDecoration: 'none',
})
export const EnterDashboard = memo(() => {
    const { t } = useI18N()
    const onEnter = useEnterDashboard()

    return (
        <Button href="/dashboard.html" target="_blank">
            <Typography style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600 }} color="primary">
                {t('browser_action_enter_dashboard')}
            </Typography>
        </Button>
    )
})
