import { Collapse, Link, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { ExternalLink } from 'react-feather'
import { makeStyles } from '@masknet/theme'
import { memo, useMemo, useState } from 'react'
import { DefineMapping, SecurityMessageLevel, TokenSecurity } from './Common'
import { RiskCard, RiskCardUI } from './RiskCard'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useTheme } from '@mui/system'
import { resolveGoLabLink } from '../../utils/helper'
import { TokenPanel } from './TokenPanel'
import { getMessageList, TokenIcon } from '@masknet/shared'
import type { TokenAPI } from '@masknet/web3-providers'
import { DefaultTokenIcon } from '@masknet/icons'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { FungibleToken } from '@masknet/web3-shared-base'

interface TokenCardProps {
    tokenSecurity: TokenSecurity
    tokenInfo?: FungibleToken<ChainId, SchemaType>
    tokenPrice?: number
    tokenMarketCap?: TokenAPI.tokenInfo
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
    itemTitle: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
    },
}))

const LIST_HEIGHT = {
    min: 154,
    max: 308,
}

export const SecurityPanel = memo<TokenCardProps>(({ tokenSecurity, tokenInfo, tokenPrice, tokenMarketCap }) => {
    const { classes } = useStyles()
    const t = useI18N()
    const theme = useTheme()

    const price = tokenPrice ?? tokenMarketCap?.price
    const [isCollapse, setCollapse] = useState(false)

    const { riskyFactors, attentionFactors, makeMessageList } = useMemo(() => {
        const makeMessageList = getMessageList(tokenSecurity)

        const riskyFactors = makeMessageList.filter((x) => x.level === SecurityMessageLevel.High).length
        const attentionFactors = makeMessageList.filter((x) => x.level === SecurityMessageLevel.Medium).length
        return { riskyFactors, attentionFactors, makeMessageList }
    }, [tokenSecurity])

    const hasWarningFactor = riskyFactors !== 0 || attentionFactors !== 0

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
                padding="16px"
                borderRadius="16px">
                <Stack direction="row" spacing={0.8}>
                    {tokenSecurity?.token_name ? (
                        <TokenIcon
                            classes={{ icon: classes.icon }}
                            address={tokenSecurity?.contract ?? ''}
                            name={tokenSecurity?.token_name}
                            logoURL={tokenInfo?.logoURL}
                            chainId={tokenSecurity?.chainId}
                        />
                    ) : (
                        <DefaultTokenIcon sx={{ fontSize: '48px' }} />
                    )}
                    <Stack>
                        <Typography className={classes.tokenName}>{tokenSecurity?.token_name || 'Unnamed'}</Typography>
                        <Typography className={classes.tokenPrice}> {price ? `$${price} USD` : '--'}</Typography>
                    </Stack>
                </Stack>
                <Stack>
                    {hasWarningFactor && (
                        <div
                            style={{
                                backgroundColor:
                                    DefineMapping[
                                        riskyFactors !== 0 ? SecurityMessageLevel.High : SecurityMessageLevel.Medium
                                    ].bgColor,
                                padding: '16px 12px 16px 18px',
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
                        <Typography component="span" lineHeight="14px" fontSize={14}>
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
                    <TokenPanel tokenSecurity={tokenSecurity} tokenMarketCap={tokenMarketCap?.market_cap} />
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
                                {DefineMapping[SecurityMessageLevel.High].icon(16)}
                                <Typography component="span" className={classes.itemTitle}>
                                    {riskyFactors > 1
                                        ? t.risky_factors({ quantity: riskyFactors.toString() })
                                        : t.risky_factor({ quantity: riskyFactors.toString() })}
                                </Typography>
                            </Stack>
                        )}
                        {attentionFactors !== 0 && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                {DefineMapping[SecurityMessageLevel.Medium].icon(16)}
                                <Typography component="span" className={classes.itemTitle}>
                                    {attentionFactors > 1
                                        ? t.attention_factors({ quantity: attentionFactors.toString() })
                                        : t.attention_factor({ quantity: attentionFactors.toString() })}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
                <Collapse
                    in={isCollapse}
                    timeout={{
                        enter: 1200,
                        exit: 10,
                    }}
                    collapsedSize={LIST_HEIGHT.min}
                    className={classes.detectionCollection}
                    sx={{ maxHeight: LIST_HEIGHT.max, overflowY: 'auto' }}>
                    <Stack spacing={1}>
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
                </Collapse>
            </Stack>
        </Stack>
    )
})
