import { memo } from 'react'
import { Box, Typography } from '@material-ui/core'
import { useEnterDashboard } from '../../hook/useEnterDashboard'

export const EnterDashboard = memo(() => {
    const onEnter = useEnterDashboard()

    return (
        <Box style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={onEnter}>
            <Typography style={{ fontSize: 12, lineHeight: '16px' }} color="primary">
                Enter Dashboard
            </Typography>
        </Box>
    )
})
