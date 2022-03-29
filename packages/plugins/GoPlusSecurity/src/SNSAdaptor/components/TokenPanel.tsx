import { Link, Stack, Tooltip, Typography } from '@mui/material'
import { DefineMapping, SecurityMessageLevel, TokenSecurity } from './Common'
import parseInt from 'lodash-es/parseInt'
import { useI18N } from '../../locales'
import { memo } from 'react'
import { useTheme } from '@mui/system'
import { ExternalLink } from 'react-feather'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import {
    ERC20Token,
    formatEthereumAddress,
    resolveAddressLinkOnExplorer,
    resolveTokenLinkOnExplorer,
} from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    card: {
        borderColor: theme.palette.divider,
        borderStyle: 'solid',
        padding: theme.spacing(1.5),
        borderRadius: 9,
    },
    subtitle: {
        color: theme.palette.text.secondary,
        fontWeight: 400,
        fontSize: 14,
    },
    cardValue: {
        color: theme.palette.text.primary,
    },
    tooltip: {
        color: theme.palette.text.buttonText,
        fontSize: 12,
    },
}))

const DEFAULT_PLACEHOLDER = '--'

function formatTotalSupply(total?: number) {
    if (!total) return DEFAULT_PLACEHOLDER
    return new BigNumber(total).toFormat(3)
}

interface TokenPanelProps {
    tokenSecurity: TokenSecurity
    securityMessageLevel: SecurityMessageLevel
}

export const TokenPanel = memo<TokenPanelProps>(({ tokenSecurity, securityMessageLevel }) => {
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
                <Stack
                    spacing={1.5}
                    borderRadius={0.5}
                    sx={{ background: DefineMapping[securityMessageLevel].bgColor }}
                    width={128}
                    height={128}
                    justifyContent="center"
                    alignItems="center">
                    {DefineMapping[securityMessageLevel].icon(33)}
                    <Typography color={DefineMapping[securityMessageLevel].titleColor} fontSize={14}>
                        {t[DefineMapping[securityMessageLevel].i18nKey]({ quantity: '' })}
                    </Typography>
                </Stack>
                <Stack height={128} justifyContent="space-between" flex={1}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography className={classes.subtitle}>{t.token_info_token_name()}</Typography>
                        <Typography className={classes.cardValue}>
                            {tokenSecurity.token_symbol}({tokenSecurity.token_name})
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
                                    chainId: parseInt(tokenSecurity.chainId),
                                    address: tokenSecurity.contract,
                                } as ERC20Token)}
                                target="_blank"
                                title={t.token_info_token_contract_address()}
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
                                        parseInt(tokenSecurity.chainId),
                                        tokenSecurity.creator_address,
                                    )}
                                    target="_blank"
                                    title={t.token_info_contract_creator()}
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
                                        parseInt(tokenSecurity.chainId),
                                        tokenSecurity.owner_address,
                                    )}
                                    target="_blank"
                                    title={t.token_info_contract_owner()}
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
                </Stack>
            </Stack>
        </Stack>
    )
})
