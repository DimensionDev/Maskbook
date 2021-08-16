import { memo } from 'react'
import { Box, Card, Grid, Stack, Typography } from '@material-ui/core'
import formatDateTime from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'
import type { BackupFileInfo } from '../../pages/Settings/type'

interface BackupInfoProps {
    info: BackupFileInfo
}

export const BackupInfoCard = memo(({ info }: BackupInfoProps) => {
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
                        <Typography variant="body2">{info.abstract}</Typography>
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
