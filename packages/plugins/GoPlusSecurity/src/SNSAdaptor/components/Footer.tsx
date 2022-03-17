import { Box, Stack } from '@mui/material'
import { useI18N } from '../../locales'
import { GoPlusLabLogo } from '../icons/Logo'

export const Footer = () => {
    const t = useI18N()
    return (
        <Stack justifyContent="flex-end" direction="row">
            <Stack direction="row">
                <Box>{t.powered_by_go_plus()}</Box>
                <GoPlusLabLogo />
            </Stack>
        </Stack>
    )
}
