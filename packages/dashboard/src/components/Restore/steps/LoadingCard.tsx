import { LoadingIcon } from '@masknet/icons'
import { Card, Stack, Typography } from '@material-ui/core'
import { memo } from 'react'

interface LoadingProps {
    text?: string
}

export const LoadingCard = memo(({ text = 'Loading' }: LoadingProps) => {
    return (
        <Card variant="background" sx={{ width: '100%' }}>
            <Stack justifyContent="center" alignItems="center" sx={{ minHeight: 140 }}>
                <LoadingIcon />
                <Typography variant="caption" marginBottom={0} marginTop="8px">
                    {text}
                </Typography>
            </Stack>
        </Card>
    )
})
