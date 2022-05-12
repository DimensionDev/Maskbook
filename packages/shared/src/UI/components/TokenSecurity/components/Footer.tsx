import { Link, Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../../locales'
import { GoPlusLabLogo } from '../icons/Logo'

const PLUGIN_OFFICIAL_WEBSITE = 'https://gopluslabs.io'

export const Footer = () => {
    const t = useSharedI18N()
    return (
        <Stack justifyContent="flex-end" direction="row">
            <Stack direction="row" alignItems="center">
                <Stack direction="row">
                    <Typography fontSize="14px" fontWeight="700" marginRight="2px">
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
                    <GoPlusLabLogo />
                </Link>
            </Stack>
        </Stack>
    )
}
