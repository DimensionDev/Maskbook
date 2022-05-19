import { Collapse, Link, Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../../locales'
import { ExternalLink } from 'react-feather'
import { makeStyles } from '@masknet/theme'
import { memo, useMemo, useState } from 'react'
import { DefineMapping, SecurityMessageLevel, TokenSecurity } from './Common'
import { SecurityMessages } from '../rules'
import { RiskCard, RiskCardUI } from './RiskCard'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useTheme } from '@mui/system'
import { TokenPanel } from './TokenPanel'
import { TokenIcon } from '@masknet/shared'
import type { ChainId, ERC721ContractDetailed, PriceRecord } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'

interface TokenCardProps {
    tokenSecurity: TokenSecurity
    tokenInfo?: ERC721ContractDetailed
    tokenPrice?: PriceRecord
    tokenMarketCap?: string
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
        color: theme.palette.text.secondary,
    },
}))

const LIST_HEIGHT = {
    min: 154,
    max: 308,
}

function resolveGoLabLink(chainId: ChainId, address: string) {
    return urlcat('https://gopluslabs.io/token-security/:chainId/:address', { chainId, address })
}

export const SecurityPanel = memo<TokenCardProps>(({ tokenSecurity, tokenInfo, tokenPrice, tokenMarketCap }) => {
    const { classes } = useStyles()
    const t = useSharedI18N()
    const theme = useTheme()

    const [isCollapse, setCollapse] = useState(false)

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

    const securityMessageLevel = useMemo(() => {
        if (riskyFactors) return SecurityMessageLevel.High
        if (attentionFactors) return SecurityMessageLevel.Medium
        return SecurityMessageLevel.Safe
    }, [riskyFactors, attentionFactors])

    return (
        <Stack spacing={2}>
            <Stack
                spacing={1}
                direction="row"
                justifyContent="space-between"
                boxShadow={(theme) =>
                    theme.palette.mode === 'light'
                        ? ' 0px 0px 20px rgba(0, 0, 0, 0.05)'
                        : '0px 0px 20px rgba(255, 255, 255, 0.12);'
                }
                marginTop="8px"
                padding="16px"
                borderRadius="16px">
                <Stack direction="row" spacing={0.8}>
                    <TokenIcon
                        classes={{ icon: classes.icon }}
                        address={(tokenSecurity?.contract || tokenInfo?.address) ?? ''}
                        name={(tokenSecurity?.token_name || tokenInfo?.name) ?? '-'}
                        logoURI={tokenInfo?.iconURL}
                    />
                    <Stack>
                        <Typography className={classes.tokenName}>
                            {(tokenSecurity?.token_name || tokenInfo?.name) ?? '--'}
                        </Typography>
                        <Typography className={classes.tokenPrice}>
                            {tokenPrice?.usd ? `$ ${tokenPrice?.usd} USD` : '--'}
                        </Typography>
                    </Stack>
                </Stack>
                <Stack>
                    {(riskyFactors !== 0 || attentionFactors !== 0) && (
                        <div
                            style={{
                                backgroundColor:
                                    DefineMapping[
                                        riskyFactors !== 0 ? SecurityMessageLevel.High : SecurityMessageLevel.Medium
                                    ].bgColor,
                                padding: '14px 12px 14px 18px',
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                            {DefineMapping[
                                riskyFactors !== 0 ? SecurityMessageLevel.High : SecurityMessageLevel.Medium
                            ].icon(24)}
                            <Typography
                                sx={{ fontSize: '16px', fontWeight: 500, marginLeft: '8px' }}
                                color={
                                    DefineMapping[
                                        riskyFactors !== 0 ? SecurityMessageLevel.High : SecurityMessageLevel.Medium
                                    ].titleColor
                                }>
                                {' '}
                                {riskyFactors !== 0 ? t.high_risk() : t.medium_risk()}
                            </Typography>
                        </div>
                    )}
                </Stack>
            </Stack>
            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                    <Stack display="inline-flex" direction="row" alignItems="center" spacing={0.6}>
                        <Typography variant="h6" className={classes.header}>
                            {t.token_info()}
                        </Typography>
                        <KeyboardArrowDownIcon
                            onClick={() => setCollapse(!isCollapse)}
                            sx={{ fontSize: 15, cursor: 'pointer' }}
                        />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography component="span" lineHeight="14px" fontSize={12}>
                            {t.more_details()}
                        </Typography>
                        <Link
                            lineHeight="14px"
                            href={resolveGoLabLink(tokenSecurity.chainId, tokenSecurity.contract)}
                            target="_blank"
                            rel="noopener noreferrer">
                            <ExternalLink color={theme.palette.text.strong} size={14} />
                        </Link>
                    </Stack>
                </Stack>
                <Collapse in={!isCollapse}>
                    <TokenPanel tokenSecurity={tokenSecurity} tokenMarketCap={tokenMarketCap} />
                </Collapse>
            </Stack>
            <Stack spacing={1.5} flex={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={3.5}>
                    <Typography variant="h6" className={classes.header}>
                        {t.security_detection()}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        {riskyFactors !== 0 && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                {DefineMapping[SecurityMessageLevel.High].icon(14)}
                                <Typography component="span">
                                    {riskyFactors > 1
                                        ? t.risky_items({ quantity: riskyFactors.toString() })
                                        : t.risky_item({ quantity: riskyFactors.toString() })}
                                </Typography>
                            </Stack>
                        )}
                        {attentionFactors !== 0 && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                {DefineMapping[SecurityMessageLevel.Medium].icon(14)}
                                <Typography component="span">
                                    {attentionFactors > 1
                                        ? t.attention_items({ quantity: attentionFactors.toString() })
                                        : t.attention_item({ quantity: attentionFactors.toString() })}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
                <Stack className={classes.detectionCollection} sx={{ maxHeight: LIST_HEIGHT.max, overflowY: 'auto' }}>
                    {makeMessageList.map((x, i) => (
                        <RiskCard tokenSecurity={tokenSecurity} info={x} key={i} />
                    ))}
                    {(!makeMessageList.length || securityMessageLevel === SecurityMessageLevel.Safe) && (
                        <RiskCardUI
                            icon={DefineMapping[SecurityMessageLevel.Safe].icon(14)}
                            title={t.risk_safe_description()}
                            titleColor={DefineMapping[SecurityMessageLevel.Safe].titleColor}
                        />
                    )}
                </Stack>
            </Stack>
        </Stack>
    )
})
