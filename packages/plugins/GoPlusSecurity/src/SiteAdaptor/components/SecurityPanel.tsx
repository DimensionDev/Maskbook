import { memo, useMemo, useState } from 'react'
import { Collapse, Link, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { useTheme } from '@mui/system'
import { TokenIcon } from '@masknet/shared'
import type { SecurityAPI } from '@masknet/web3-providers/types'
import { Icons } from '@masknet/icons'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { formatCurrency, type FungibleToken } from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import { DefineMapping, SecurityMessageLevel } from '../constants.js'
import { TokenPanel } from './TokenPanel.js'
import { RiskCard, RiskCardUI } from './RiskCard.js'
import { resolveGoLabLink } from '../../utils/helper.js'
import { useGoPlusLabsTrans } from '../../locales/index.js'

interface TokenCardProps {
    tokenSecurity: SecurityAPI.TokenSecurityType
    tokenInfo?: FungibleToken<ChainId, SchemaType>
    tokenPrice?: number
    tokenMarketCap?: number | null
}

const useStyles = makeStyles()((theme) => ({
    header: {
        fontWeight: 700,
        fontSize: 18,
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
        fontSize: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    tokenPrice: {
        fontSize: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
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
    const t = useGoPlusLabsTrans()
    const theme = useTheme()

    const [isCollapse, setCollapse] = useState(false)
    const {
        risk_item_quantity: riskyFactors = 0,
        warn_item_quantity: attentionFactors = 0,
        message_list: makeMessageList = EMPTY_LIST,
    } = tokenSecurity

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
                    theme.palette.mode === 'light' ?
                        ' 0px 0px 20px rgba(0, 0, 0, 0.05)'
                    :   '0px 0px 20px rgba(255, 255, 255, 0.12);'
                }
                padding="16px"
                borderRadius="16px">
                <Stack direction="row" spacing={0.8}>
                    {tokenSecurity?.token_name ?
                        <TokenIcon
                            className={classes.icon}
                            address={tokenSecurity.contract ?? ''}
                            name={tokenSecurity.token_name}
                            logoURL={tokenInfo?.logoURL}
                            chainId={tokenSecurity.chainId}
                        />
                    :   <Icons.DefaultToken size={48} />}
                    <Stack>
                        <Typography className={classes.tokenName}>
                            {tokenSecurity?.token_name || t.unnamed()}
                        </Typography>
                        <Typography className={classes.tokenPrice}>
                            {tokenPrice ? formatCurrency(tokenPrice) : '--'}
                        </Typography>
                    </Stack>
                </Stack>
                {hasWarningFactor ?
                    <Stack>
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
                    </Stack>
                :   null}
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
                        <Typography component="span" lineHeight="14px" fontSize={14} fontWeight={400}>
                            {t.more_details()}
                        </Typography>
                        <Link
                            lineHeight="14px"
                            href={resolveGoLabLink(tokenSecurity.chainId, tokenSecurity.contract)}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icons.LinkOut size={18} style={{ color: theme.palette.text.strong, marginTop: 2 }} />
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
                                {DefineMapping[SecurityMessageLevel.High].icon(16)}
                                <Typography component="span" className={classes.itemTitle}>
                                    {riskyFactors > 1 ?
                                        t.risky_factors({ quantity: riskyFactors.toString() })
                                    :   t.risky_factor({ quantity: riskyFactors.toString() })}
                                </Typography>
                            </Stack>
                        )}
                        {attentionFactors !== 0 && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                {DefineMapping[SecurityMessageLevel.Medium].icon(16)}
                                <Typography component="span" className={classes.itemTitle}>
                                    {attentionFactors > 1 ?
                                        t.attention_factors({ quantity: attentionFactors.toString() })
                                    :   t.attention_factor({ quantity: attentionFactors.toString() })}
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
SecurityPanel.displayName = 'SecurityPanel'
