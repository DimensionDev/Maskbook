import { MaskColorVar } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { Trans } from '@lingui/macro'

export function NotFound() {
    return (
        <Stack justifyContent="flex-start" alignItems="flex-start">
            <Typography fontSize={12} color={MaskColorVar.orangeMain}>
                <Trans>
                    Results not found now. it might be chain network error, on-chain data abnormal or the token address
                    is not covered now. please check as followings:
                </Trans>
            </Typography>
            <Typography fontSize={12} color={MaskColorVar.orangeMain}>
                <Trans>1. Make sure network is working;</Trans>
            </Typography>
            <Typography fontSize={12} color={MaskColorVar.orangeMain}>
                <Trans>2. Make sure the chain network or token address is correct;</Trans>
            </Typography>
            <Typography fontSize={12} color={MaskColorVar.orangeMain}>
                <Trans>
                    3. Token address is not covered now, it might take more than 60s to get contract information again.
                    Please try it later.
                </Trans>
            </Typography>
        </Stack>
    )
}
