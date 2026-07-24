import { memo } from 'react'
import { Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import type { SecurityAPI } from '@masknet/web3-providers/types'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { DefineMapping, SecurityMessageLevel } from './Common.js'
import { Plural, Trans } from '@lingui/react/macro'

interface TokenCardProps {
    tokenSecurity: SecurityAPI.TokenSecurityType
}

export const TokenSecurityBar = memo<TokenCardProps>(({ tokenSecurity }) => {
    const { warn_item_quantity: attentionFactors = 0, risk_item_quantity: riskyFactors = 0 } = tokenSecurity

    const handleOpenDialog = () => {
        CrossIsolationMessages.events.checkSecurityDialogEvent.sendToLocal({
            open: true,
            searchHidden: true,
            tokenAddress: tokenSecurity.contract,
            chainId: tokenSecurity.chainId,
        })
    }

    return (
        <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
            {riskyFactors !== 0 && (
                <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                        alignItems: 'center',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        bgcolor: DefineMapping[SecurityMessageLevel.High].bgColor,
                    }}>
                    {DefineMapping[SecurityMessageLevel.High].icon(14)}
                    <Typography
                        component="span"
                        sx={{ color: DefineMapping[SecurityMessageLevel.High].titleColor, fontSize: '12px' }}>
                        <Plural one="# Risky item" other="# Risky items" value={riskyFactors} />
                    </Typography>
                </Stack>
            )}
            {attentionFactors !== 0 && (
                <Stack
                    direction="row"
                    sx={{
                        alignItems: 'center',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        bgcolor: DefineMapping[SecurityMessageLevel.Medium].bgColor,
                    }}
                    spacing={0.5}>
                    {DefineMapping[SecurityMessageLevel.Medium].icon(14)}
                    <Typography
                        component="span"
                        sx={{ color: DefineMapping[SecurityMessageLevel.Medium].titleColor, fontSize: '12px' }}>
                        <Plural one="# Attention item" other="# Attention items" value={attentionFactors} />
                    </Typography>
                </Stack>
            )}
            {(attentionFactors !== 0 || riskyFactors !== 0) && (
                <Stack
                    direction="row"
                    sx={{
                        alignItems: 'center',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        bgcolor: 'rgba(28, 104, 243, 0.1)',
                        cursor: 'pointer',
                    }}
                    onClick={handleOpenDialog}
                    spacing={0.5}>
                    <Typography component="span" sx={{ fontSize: '12px', color: '#1C68F3' }}>
                        <Trans>More</Trans>
                    </Typography>
                    <Icons.RightArrow size={14} color="#1C68F3" />
                </Stack>
            )}
        </Stack>
    )
})
