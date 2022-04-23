import { MaskColorVar } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'

export const NotFound = () => {
    const t = useI18N()
    return (
        <Stack justifyContent="flex-start" alignItems="flex-start">
            <Typography fontSize={12} color={MaskColorVar.orangeMain}>
                {t.not_found_tip_title()}
            </Typography>
            <Typography fontSize={12} color={MaskColorVar.orangeMain}>
                {t.not_found_tip_network_error()}
            </Typography>
            <Typography fontSize={12} color={MaskColorVar.orangeMain}>
                {t.not_found_tip_network_chain_correct()}
            </Typography>
            <Typography fontSize={12} color={MaskColorVar.orangeMain}>
                {t.not_found_tip_network_address_not_cover()}
            </Typography>
        </Stack>
    )
}
