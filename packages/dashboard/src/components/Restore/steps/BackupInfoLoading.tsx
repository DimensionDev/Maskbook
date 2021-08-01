import { Card, Stack } from '@material-ui/core'

export const BackupInfoLoading = () => {
    // todo: add loading icon
    return (
        <Card variant="background">
            <Stack justifyContent="center" alignItems="center" sx={{ minHeight: 140 }}>
                Loading
            </Stack>
        </Card>
    )
}
