import { memo } from 'react'
import { Box, Typography } from '@material-ui/core'
import { useEnter } from '../../hook/useEnter'

export const EnterDashboard = memo(() => {
    const onEnter = useEnter()

    return (
        <Box style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={onEnter}>
            <Typography style={{ fontSize: 12, lineHeight: '16px' }} color="primary">
                Enter Dashboard
            </Typography>
        </Box>
    )
})
