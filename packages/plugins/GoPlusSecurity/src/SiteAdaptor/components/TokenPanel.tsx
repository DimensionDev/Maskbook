import { Link, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/system'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { formatMarketCap, formatSupply } from '@masknet/web3-shared-base'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import type { SecurityAPI } from '@masknet/web3-providers/types'
import { useGoPlusLabsTrans } from '../../locales/index.js'
import type { RefAttributes } from 'react'

const useStyles = makeStyles()((theme) => ({
    card: {
        padding: 16,
        borderRadius: 9,
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
    },
    subtitle: {
        color: theme.palette.text.secondary,
        fontWeight: 400,
        fontSize: 16,
    },
    cardValue: {
        color: theme.palette.text.primary,
        fontSize: 16,
        fontWeight: 700,
    },
}))

const DEFAULT_PLACEHOLDER = '--'

interface TokenPanelProps extends RefAttributes<HTMLDivElement> {
    tokenSecurity: SecurityAPI.TokenSecurityType
    tokenMarketCap?: number | null
}

export function TokenPanel({ tokenSecurity, tokenMarketCap, ref }: TokenPanelProps) {
    const t = useGoPlusLabsTrans()
    const { classes } = useStyles()
    const theme = useTheme()

    return (
        <Stack ref={ref} className={classes.card} spacing={2}>
            <Stack height={128} justifyContent="space-between" flex={1}>
                <Stack direction="row" justifyContent="space-between">
                    <Typography className={classes.subtitle}>{t.token_info_token_name()}</Typography>
                    <Typography className={classes.cardValue}>
                        {tokenSecurity.token_symbol}
                        {tokenSecurity.token_name ? `(${tokenSecurity.token_name})` : null}{' '}
                    </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                    <Typography className={classes.subtitle}>{t.token_info_token_contract_address()}</Typography>
                    <Stack display="inline-flex" direction="row" alignItems="center" spacing={0.625}>
                        <Typography className={classes.cardValue}>
                            {tokenSecurity.contract ?
                                formatEthereumAddress(tokenSecurity.contract, 4)
                            :   DEFAULT_PLACEHOLDER}
                        </Typography>
                        <Link
                            lineHeight="14px"
                            href={EVMExplorerResolver.fungibleTokenLink(tokenSecurity.chainId, tokenSecurity.contract)}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icons.LinkOut
                                style={{ color: theme.palette.text.strong, width: 18, height: 18, marginTop: 2 }}
                            />
                        </Link>
                    </Stack>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                    <Typography className={classes.subtitle}>{t.token_info_contract_creator()}</Typography>
                    <Stack display="inline-flex" direction="row" alignItems="center" spacing={0.625}>
                        <Typography className={classes.cardValue}>
                            {tokenSecurity.creator_address ?
                                formatEthereumAddress(tokenSecurity.creator_address ?? '', 4)
                            :   DEFAULT_PLACEHOLDER}
                        </Typography>
                        {tokenSecurity.creator_address ?
                            <Link
                                lineHeight="14px"
                                href={EVMExplorerResolver.addressLink(
                                    tokenSecurity.chainId,
                                    tokenSecurity.creator_address,
                                )}
                                target="_blank"
                                rel="noopener noreferrer">
                                <Icons.LinkOut
                                    style={{ color: theme.palette.text.strong, width: 18, height: 18, marginTop: 2 }}
                                />
                            </Link>
                        :   null}
                    </Stack>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                    <Typography className={classes.subtitle}>{t.token_info_contract_owner()}</Typography>
                    <Stack display="inline-flex" direction="row" alignItems="center" spacing={0.625}>
                        <Typography className={classes.cardValue}>
                            {tokenSecurity.owner_address ?
                                formatEthereumAddress(tokenSecurity.owner_address ?? '', 4)
                            :   DEFAULT_PLACEHOLDER}
                        </Typography>
                        {tokenSecurity.owner_address ?
                            <Link
                                lineHeight="14px"
                                href={EVMExplorerResolver.addressLink(
                                    tokenSecurity.chainId,
                                    tokenSecurity.owner_address,
                                )}
                                target="_blank"
                                rel="noopener noreferrer">
                                <Icons.LinkOut size={14} color={theme.palette.text.strong} />
                            </Link>
                        :   null}
                    </Stack>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                    <Typography className={classes.subtitle}>{t.token_info_total_supply()}</Typography>
                    <Typography className={classes.cardValue}>
                        {tokenSecurity.total_supply ? formatSupply(tokenSecurity.total_supply) : DEFAULT_PLACEHOLDER}
                    </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                    <Typography className={classes.subtitle}>{t.token_market_cap()}</Typography>
                    <Typography className={classes.cardValue}>
                        {tokenMarketCap ? formatMarketCap(tokenMarketCap) : DEFAULT_PLACEHOLDER}
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    )
}
