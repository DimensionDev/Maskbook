import { Box, Stack } from '@mui/material'
import { SecurityIcon } from '../icons/SecurityIcon'
import { useI18N } from '../../locales'

export const NotFound = () => {
    const t = useI18N()
    return (
        <Stack>
            <Box>
                <Box>
                    <SecurityIcon />
                </Box>
                <Box>{t.not_found_tip()}</Box>
            </Box>
        </Stack>
    )
}
