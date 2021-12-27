import { memo } from 'react'
import { Box, Card, Grid, Stack, Typography } from '@mui/material'
import formatDateTime from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'
import type { BackupFileInfo } from '../../pages/Settings/type'
import Tooltip from '@mui/material/Tooltip'

interface BackupInfoProps {
    info: BackupFileInfo
}

export const BackupInfoCard = memo(({ info }: BackupInfoProps) => {
    const economizeAbstract = (str: string) => {
        if (!str.length) return <div>error</div>
        if (str.length < 30) return <div>{str}</div>
        return (
            <Tooltip title={str} placement="top" arrow>
                <div>{str.substr(0, 30) + '...' + '(' + str.split(',').length + ')'}</div>
            </Tooltip>
        )
    }
    return (
        <Card variant="background">
            <Grid
                container
                spacing={2}
                direction="row"
                justifyContent="center"
                alignItems="center"
                sx={{ padding: '8px' }}>
                <Grid item xs={10}>
                    <Stack spacing={1}>
                        <Typography variant="body2">{economizeAbstract(info.abstract)}</Typography>
                        <Typography variant="body2">
                            {formatDateTime(fromUnixTime(info.uploadedAt), 'yyyy-MM-dd HH:mm')}
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item xs={2}>
                    <Box>
                        <Typography align="right" variant="body2">
                            {Math.ceil(info.size / 1024)}K
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Card>
    )
})
