import { Box, Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useGoPlusLabsTrans } from '../../locales/index.js'

export function DefaultPlaceholder() {
    const t = useGoPlusLabsTrans()
    return (
        <Stack alignItems="center" spacing={2.5}>
            <Box>
                <Icons.SecurityChecker size={48} />
            </Box>
            <Box>
                <Typography variant="body2">{t.default_placeholder()}</Typography>
            </Box>
        </Stack>
    )
}
