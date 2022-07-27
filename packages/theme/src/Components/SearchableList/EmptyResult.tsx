import { Stack, Typography } from '@mui/material'
import { EmptySimpleIcon } from '@masknet/icons'

export const EmptyResult = () => {
    return (
        <Stack justifyContent="center" alignItems="center" gap={1.5}>
            <EmptySimpleIcon size={36} />
            <Typography>No results</Typography>
        </Stack>
    )
}
