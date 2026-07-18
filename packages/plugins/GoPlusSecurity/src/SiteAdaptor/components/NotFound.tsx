import { MaskColorVar } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { Trans } from '@lingui/react/macro'

export function NotFound() {
    return (
        <Stack sx={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Trans>
                <Typography color={MaskColorVar.orangeMain} sx={{ fontSize: 12 }}>
                    Results not found now. it might be chain network error, on-chain data abnormal or the token address
                    is not covered now. please check as followings:
                </Typography>
                <Typography color={MaskColorVar.orangeMain} sx={{ fontSize: 12 }}>
                    1. Make sure network is working;
                </Typography>
                <Typography color={MaskColorVar.orangeMain} sx={{ fontSize: 12 }}>
                    2. Make sure the chain network or token address is correct;
                </Typography>
                <Typography color={MaskColorVar.orangeMain} sx={{ fontSize: 12 }}>
                    3. Token address is not covered now, it might take more than 60s to get contract information again.
                    Please try it later.
                </Typography>
            </Trans>
        </Stack>
    )
}
