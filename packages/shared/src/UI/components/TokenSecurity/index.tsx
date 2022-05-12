import { Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../locales'
import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { DefineMapping, SecurityMessageLevel, TokenSecurity } from './Common'
import { SecurityMessages } from './rules'
import { RightArrowIcon } from '@masknet/icons'

interface TokenCardProps {
    tokenSecurity: TokenSecurity
}

const useStyles = makeStyles()((theme) => ({
    header: {
        fontWeight: 500,
        fontSize: 18,
    },
    root: {
        width: '600px',
    },
    detectionCard: {
        backgroundColor: theme.palette.background.default,
    },
    detectionCollection: {
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    icon: {
        width: '48px',
        height: '48px',
    },
    tokenName: {
        fontSize: '16px',
        fontWeight: 700,
    },
    tokenPrice: {
        fontSize: '16px',
        fontWeight: 700,
    },
}))

export const TokenSecurityBar = memo<TokenCardProps>(({ tokenSecurity }) => {
    const t = useSharedI18N()

    const makeMessageList =
        tokenSecurity.is_whitelisted === '1'
            ? []
            : SecurityMessages.filter(
                  (x) =>
                      x.condition(tokenSecurity) &&
                      x.level !== SecurityMessageLevel.Safe &&
                      !x.shouldHide(tokenSecurity),
              ).sort((a) => (a.level === SecurityMessageLevel.High ? -1 : 1))

    const riskyFactors = makeMessageList.filter((x) => x.level === SecurityMessageLevel.High).length
    const attentionFactors = makeMessageList.filter((x) => x.level === SecurityMessageLevel.Medium).length

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
                    spacing={0.5}>
                    <Typography component="span" fontSize="12px" color="#1C68F3">
                        {t.more()}
                    </Typography>
                    <RightArrowIcon sx={{ fontSize: '14px', color: '#1C68F3' }} />
                </Stack>
            )}
        </Stack>
    )
})
