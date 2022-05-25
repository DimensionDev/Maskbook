import { Link, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { GoPlusLabLogo } from '../icons/Logo'
import { PLUGIN_OFFICIAL_WEBSITE } from '../../constants'

export const Footer = () => {
    const t = useI18N()
    return (
        <Stack justifyContent="flex-end" direction="row">
            <Stack direction="row">
                <Typography fontSize="14px" fontWeight="700" marginRight="4px">
                    {t.powered_by()}
                </Typography>
                <Typography
                    fontSize="14px"
                    color={(theme) => theme.palette.text.secondary}
                    fontWeight="700"
                    marginRight="12px">
                    {t.go_plus()}
                </Typography>
            </Stack>
            <Link href={PLUGIN_OFFICIAL_WEBSITE} target="_blank" rel="noopener noreferrer">
                <GoPlusLabLogo sx={{ fontSize: '16px' }} />
            </Link>
        </Stack>
    )
}
