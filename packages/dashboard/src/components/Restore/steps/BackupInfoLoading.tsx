import { LoadingIcon } from '@masknet/icons'
import { Card, Stack, Typography } from '@material-ui/core'

export const BackupInfoLoading = () => {
    // todo: add loading icon
    return (
        <Card variant="background">
            <Stack justifyContent="center" alignItems="center" sx={{ minHeight: 140 }}>
                <LoadingIcon />
                <Typography variant="body2" marginBottom={0} marginTop="8px">
                    Loading
                </Typography>
            </Stack>
        </Card>
    )
}
