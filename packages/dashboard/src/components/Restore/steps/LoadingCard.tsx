import { LoadingIcon } from '@masknet/icons'
import { Card, Stack, Typography } from '@material-ui/core'

interface LoadingProps {
    text?: string
}

export const LoadingCard = ({ text = 'Loading' }: LoadingProps) => {
    // todo: add loading icon
    return (
        <Card variant="background" sx={{ width: '100%' }}>
            <Stack justifyContent="center" alignItems="center" sx={{ minHeight: 140 }}>
                <LoadingIcon />
                <Typography variant="body2" marginBottom={0} marginTop="8px">
                    {text}
                </Typography>
            </Stack>
        </Card>
    )
}
