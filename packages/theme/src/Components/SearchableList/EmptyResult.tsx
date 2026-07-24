import { Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'

export function EmptyResult() {
    return (
        <Stack sx={{ justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
            <Icons.EmptySimple size={36} />
            <Typography>No results</Typography>
        </Stack>
    )
}
