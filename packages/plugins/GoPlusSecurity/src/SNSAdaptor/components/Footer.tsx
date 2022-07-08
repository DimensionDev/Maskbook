import { Box, Link, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { GoPlusLabLogo } from '../icons/Logo'
import { PLUGIN_OFFICIAL_WEBSITE } from '../../constants'

export const Footer = () => {
    const t = useI18N()
    return (
        <Stack justifyContent="flex-end" direction="row">
            <Box display="flex" justifyContent="center">
                <Link href={PLUGIN_OFFICIAL_WEBSITE} target="_blank" underline="none" rel="noopener noreferrer">
                    <Stack direction="row" justifyContent="center">
                        <Typography
                            fontSize="14px"
                            color={(theme) => theme.palette.maskColor.second}
                            fontWeight="700"
                            marginRight="4px">
                            {t.powered_by()}
                        </Typography>
                        <Typography
                            fontSize="14px"
                            color={(theme) => theme.palette.maskColor.main}
                            fontWeight="700"
                            marginRight="12px">
                            {t.go_plus()}
                        </Typography>
                        <GoPlusLabLogo style={{ width: 24, height: 24 }} />
                    </Stack>
                </Link>
            </Box>
        </Stack>
    )
}
