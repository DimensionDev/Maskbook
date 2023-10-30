import { memo } from 'react'
import { Stack, Typography, type StackProps } from '@mui/material'
import { Icons } from '@masknet/icons'
import type { SecurityAPI } from '@masknet/web3-providers/types'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useSharedTrans } from '../../../locales/index.js'
import { DefineMapping, SecurityMessageLevel } from './Common.js'

interface TokenCardProps {
    tokenSecurity: SecurityAPI.TokenSecurityType
}

export const TokenSecurityBar = memo<TokenCardProps>(({ tokenSecurity }) => {
    const t = useSharedTrans()

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
        <Stack direction="row" alignItems="center" spacing={1.5}>
            {riskyFactors !== 0 && (
                <Stack
                    direction="row"
                    alignItems="center"
                    borderRadius="4px"
                    padding="4px 8px"
                    bgcolor={DefineMapping[SecurityMessageLevel.High].bgColor}
                    spacing={0.5}>
                    {DefineMapping[SecurityMessageLevel.High].icon(14)}
                    <Typography
                        component="span"
                        fontSize="12px"
                        color={DefineMapping[SecurityMessageLevel.High].titleColor}>
                        {riskyFactors > 1
                            ? t.risky_items({ quantity: riskyFactors.toString() })
                            : t.risky_item({ quantity: riskyFactors.toString() })}
                    </Typography>
                </Stack>
            )}
            {attentionFactors !== 0 && (
                <Stack
                    direction="row"
                    alignItems="center"
                    borderRadius="4px"
                    padding="4px 8px"
                    bgcolor={DefineMapping[SecurityMessageLevel.Medium].bgColor}
                    spacing={0.5}>
                    {DefineMapping[SecurityMessageLevel.Medium].icon(14)}
                    <Typography
                        component="span"
                        fontSize="12px"
                        color={DefineMapping[SecurityMessageLevel.Medium].titleColor}>
                        {attentionFactors > 1
                            ? t.attention_items({ quantity: attentionFactors.toString() })
                            : t.attention_item({ quantity: attentionFactors.toString() })}
                    </Typography>
                </Stack>
            )}
            {(attentionFactors !== 0 || riskyFactors !== 0) && (
                <Stack
                    direction="row"
                    alignItems="center"
                    borderRadius="4px"
                    padding="4px 8px"
                    bgcolor="rgba(28, 104, 243, 0.1)"
                    sx={{ cursor: 'pointer' }}
                    onClick={handleOpenDialog}
                    spacing={0.5}>
                    <Typography component="span" fontSize="12px" color="#1C68F3">
                        {t.more()}
                    </Typography>
                    <Icons.RightArrow size={14} color="#1C68F3" />
                </Stack>
            )}
        </Stack>
    )
})

export const NFTSpamBadge = memo(function NFTSpamBadge(props: StackProps) {
    const t = useSharedTrans()

    return (
        <Stack
            direction="row"
            alignItems="center"
            borderRadius="4px"
            padding="4px 8px"
            bgcolor={DefineMapping[SecurityMessageLevel.High].bgColor}
            spacing={0.5}
            {...props}>
            {DefineMapping[SecurityMessageLevel.High].icon(14)}
            <Typography component="span" fontSize="12px" color={DefineMapping[SecurityMessageLevel.High].titleColor}>
                {t.spam()}
            </Typography>
        </Stack>
    )
})
