import { Box, Link, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { GoPlusLabLogo } from '../icons/Logo'
import { PLUGIN_OFFICIAL_WEBSITE } from '../../constants'

export const Footer = () => {
    const t = useI18N()
    return (
        <Stack justifyContent="flex-end" direction="row">
            <Stack direction="row" alignItems="center">
                <Box sx={{ display: 'flex' }}>
                    <Typography variant="body2" mr={1} color="textSecondary" fontSize={14} fontWeight={700}>
                        Powered by
                    </Typography>
                    <Typography mr={1} variant="body2" color="textPrimary" fontSize={14} fontWeight={700}>
                        GO+
                    </Typography>
                </Box>
                <Link href={PLUGIN_OFFICIAL_WEBSITE} target="_blank" rel="noopener noreferrer">
                    <GoPlusLabLogo style={{ width: 24, height: 16 }} />
                </Link>
            </Stack>
        </Stack>
    )
}
