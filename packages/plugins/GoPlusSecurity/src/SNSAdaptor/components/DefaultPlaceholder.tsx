import { Box, Stack } from '@mui/material'
import { SecurityIcon } from '../icons/SecurityIcon'
import { useI18N } from '../../locales'

export const DefaultPlaceholder = () => {
    const t = useI18N()
    return (
        <Stack>
            <Box>
                <Box>
                    <SecurityIcon />
                </Box>
                <Box>{t.default_placeholder()}</Box>
            </Box>
        </Stack>
    )
}
