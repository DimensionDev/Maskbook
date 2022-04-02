import { Box, Stack, Typography } from '@mui/material'
import { SecurityCheckerIcon } from '@masknet/icons'
import { useI18N } from '../../locales'

export const DefaultPlaceholder = () => {
    const t = useI18N()
    return (
        <Stack alignItems="center" spacing={2.5}>
            <Box>
                <SecurityCheckerIcon sx={{ fontSize: 48 }} />
            </Box>
            <Box>
                <Typography variant="body2">{t.default_placeholder()}</Typography>
            </Box>
        </Stack>
    )
}
