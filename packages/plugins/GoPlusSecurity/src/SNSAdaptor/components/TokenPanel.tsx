import { Link, Stack, Tooltip, Typography } from '@mui/material'
import type { TokenSecurity } from './Common'
import { useI18N } from '../../locales'
import React from 'react'
import { useTheme } from '@mui/system'
import { ExternalLink } from 'react-feather'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import {
    ERC20Token,
    formatCurrency,
    formatEthereumAddress,
    resolveAddressLinkOnExplorer,
    resolveTokenLinkOnExplorer,
} from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    card: {
        padding: theme.spacing(1.5),
        borderRadius: 9,
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12)',
    },
    subtitle: {
        color: theme.palette.text.secondary,
        fontWeight: 400,
        fontSize: 14,
    },
    cardValue: {
        color: theme.palette.text.primary,
        fontSize: 14,
    },
    tooltip: {
        color: theme.palette.text.buttonText,
        fontSize: 12,
    },
}))

const DEFAULT_PLACEHOLDER = '--'

function formatTotalSupply(total?: number) {
    if (!total) return DEFAULT_PLACEHOLDER
    return formatCurrency(total)
}

interface TokenPanelProps {
    tokenSecurity: TokenSecurity
    tokenMarketCap?: string
}

export const TokenPanel = React.forwardRef(({ tokenSecurity, tokenMarketCap }: TokenPanelProps, ref) => {
    const t = useI18N()
    const { classes } = useStyles()
    const theme = useTheme()

    const totalSupply = usePortalShadowRoot((container) => {
        return (
            <Tooltip
                PopperProps={{ container }}
                arrow
                title={
                    <Typography color={(theme) => theme.palette.text.buttonText} className={classes.tooltip}>
                        {tokenSecurity.total_supply}
                    </Typography>
                }>
                <Typography className={classes.cardValue}>{formatTotalSupply(tokenSecurity.total_supply)}</Typography>
            </Tooltip>
        )
    })

    return (
        <Stack>
            <Stack direction="row" className={classes.card} spacing={2}>
                <Stack height={128} justifyContent="space-between" flex={1}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography className={classes.subtitle}>{t.token_info_token_name()}</Typography>
                        <Typography className={classes.cardValue}>
                            {tokenSecurity.token_symbol}
                            {tokenSecurity.token_name && `(${tokenSecurity.token_name})`}{' '}
                        </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography className={classes.subtitle}>{t.token_info_token_contract_address()}</Typography>
                        <Stack display="inline-flex" direction="row" alignItems="center" spacing={0.625}>
                            <Typography className={classes.cardValue}>
                                {tokenSecurity.contract
                                    ? formatEthereumAddress(tokenSecurity.contract, 4)
                                    : DEFAULT_PLACEHOLDER}
                            </Typography>
                            <Link
                                lineHeight="14px"
                                href={resolveTokenLinkOnExplorer({
                                    chainId: tokenSecurity.chainId,
                                    address: tokenSecurity.contract,
                                } as ERC20Token)}
                                target="_blank"
                                rel="noopener noreferrer">
                                <ExternalLink color={theme.palette.text.strong} size={14} />
                            </Link>
                        </Stack>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography className={classes.subtitle}>{t.token_info_contract_creator()}</Typography>
                        <Stack display="inline-flex" direction="row" alignItems="center" spacing={0.625}>
                            <Typography className={classes.cardValue}>
                                {tokenSecurity.creator_address
                                    ? formatEthereumAddress(tokenSecurity.creator_address ?? '', 4)
                                    : DEFAULT_PLACEHOLDER}
                            </Typography>
                            {tokenSecurity.creator_address && (
                                <Link
                                    lineHeight="14px"
                                    href={resolveAddressLinkOnExplorer(
                                        tokenSecurity.chainId,
                                        tokenSecurity.creator_address,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <ExternalLink color={theme.palette.text.strong} size={14} />
                                </Link>
                            )}
                        </Stack>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography className={classes.subtitle}>{t.token_info_contract_owner()}</Typography>
                        <Stack display="inline-flex" direction="row" alignItems="center" spacing={0.625}>
                            <Typography className={classes.cardValue}>
                                {tokenSecurity.owner_address
                                    ? formatEthereumAddress(tokenSecurity.owner_address ?? '', 4)
                                    : DEFAULT_PLACEHOLDER}
                            </Typography>
                            {tokenSecurity.owner_address && (
                                <Link
                                    lineHeight="14px"
                                    href={resolveAddressLinkOnExplorer(
                                        tokenSecurity.chainId,
                                        tokenSecurity.owner_address,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <ExternalLink color={theme.palette.text.strong} size={14} />
                                </Link>
                            )}
                        </Stack>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography className={classes.subtitle}>{t.token_info_total_supply()}</Typography>
                        {totalSupply}
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography className={classes.subtitle}>{t.token_market_cap()}</Typography>
                        {tokenMarketCap ? `$${formatCurrency(tokenMarketCap)}` : DEFAULT_PLACEHOLDER}
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    )
})
