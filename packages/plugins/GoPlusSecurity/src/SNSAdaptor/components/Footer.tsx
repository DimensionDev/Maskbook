import { Box, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { GoPlusLabLogo } from '../icons/Logo'

export const Footer = () => {
    const t = useI18N()
    return (
        <Stack justifyContent="flex-end" direction="row">
            <Stack direction="row" alignItems="center">
                <Box>
                    <Typography variant="body2" mr={1.25}>
                        {t.powered_by_go_plus()}
                    </Typography>
                </Box>
                <GoPlusLabLogo />
            </Stack>
        </Stack>
    )
}
