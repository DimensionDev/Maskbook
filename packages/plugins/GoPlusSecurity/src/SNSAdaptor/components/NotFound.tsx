import { Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'

export const NotFound = () => {
    const t = useI18N()
    return (
        <Stack justifyContent="flex-start" alignItems="flex-start">
            <Typography fontSize={12} color={(t) => t.palette.error.main}>
                {t.not_found_tip()}
            </Typography>
        </Stack>
    )
}
