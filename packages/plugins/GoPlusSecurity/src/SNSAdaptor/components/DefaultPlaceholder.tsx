import { Box, Stack, Typography } from '@mui/material'
import { Icon } from '@masknet/icons'
import { useI18N } from '../../locales'

export const DefaultPlaceholder = () => {
    const t = useI18N()
    return (
        <Stack alignItems="center" spacing={2.5}>
            <Box>
                <Icon type="securityChecker" size={36} />
            </Box>
            <Box>
                <Typography variant="body2">{t.default_placeholder()}</Typography>
            </Box>
        </Stack>
    )
}
