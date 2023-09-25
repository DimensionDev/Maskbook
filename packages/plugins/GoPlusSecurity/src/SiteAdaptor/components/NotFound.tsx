import { MaskColorVar } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { useGoPlusLabsTrans } from '../../locales/index.js'

export function NotFound() {
    const t = useGoPlusLabsTrans()
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
