import React from 'react'
import { Typography, makeStyles, createStyles, Box, ButtonBase } from '@material-ui/core'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import classNames from 'classnames'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useSnackbarCallback } from '../DashboardDialogs/Base'
import ActionButton from './ActionButton'
import { TokenIcon } from './TokenIcon'
import { Address } from './Address'
import type { ERC20TokenDetails } from '../../background-script/PluginService'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { ProviderType } from '../../../web3/types'
import { useConstant } from '../../../web3/hooks/useConstant'
import { resolveProviderName } from '../../../web3/pipes'
import { CONSTANTS } from '../../../web3/constants'

const useStyles = makeStyles((theme) =>
    createStyles({
        container: {
            opacity: 0.75,
            padding: theme.spacing(3, 2, 2, 3),
            borderBottom: `1px solid ${theme.palette.divider}`,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'baseline',
            '&::after': {
                content: '""',
                position: 'absolute',
                transition: 'transform 0.3s ease, opacity 0.1s linear',
                height: '100%',
                opacity: 0,
                transform: 'scaleY(0)',
                transformOrigin: 'center',
                bottom: 0,
                right: 0,
                width: '4px',
                backgroundColor: theme.palette.primary.main,
            },
            [theme.breakpoints.down('xs')]: {
                opacity: 'unset',
                padding: theme.spacing(2, 6, 2, 2),
                '&::after': {
                    display: 'none',
                },
            },
        },
        default: {
            '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                borderTop: '12px solid #F8B03E',
                borderBottom: '12px solid transparent',
                borderLeft: '12px solid #F8B03E',
                borderRight: '12px solid transparent',
            },
        },
        selected: {
            opacity: 'unset',
            '&::after': {
                opacity: 100,
                transform: 'scaleY(1)',
            },
        },
        title: {
            color: theme.palette.text.primary,
            fontSize: 24,
            fontWeight: 500,
            lineHeight: '34px',
            wordBreak: 'break-all',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            [theme.breakpoints.down('xs')]: {
                fontSize: 20,
            },
        },
        label: {
            color: theme.palette.text.secondary,
            fontWeight: 500,
            [theme.breakpoints.down('xs')]: {
                display: 'none',
            },
        },
        address: {
            width: '100%',
            color: theme.palette.text.primary,
            fontFamily: 'var(--monospace)',
        },
        coin: {
            marginTop: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        chevron: {
            left: 'auto',
            right: theme.spacing(2),
            position: 'absolute',
        },
    }),
)

interface WalletItemProps {
    wallet: WalletRecord
    selected?: boolean
    tokens?: ERC20TokenDetails[]
    onClick?(): void
}

export function WalletItem(props: WalletItemProps) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')

    const { t } = useI18N()
    const classes = useStyles()
    const xsMatched = useMatchXS()

    const { wallet, selected, onClick, tokens } = props
    const [, copyToClipboard] = useCopyToClipboard()
    const copyWalletAddress = useSnackbarCallback(async (address: string) => copyToClipboard(address), [])
    return (
        <ButtonBase
            component="section"
            onClick={onClick}
            className={classNames(classes.container, {
                [classes.selected]: selected,
                [classes.default]: wallet?._wallet_is_default,
            })}>
            <Typography className={classes.title} variant="h5">
                {wallet.name}
            </Typography>
            <Box className={classes.address} paddingY={xsMatched ? 0 : 2}>
                <Typography className={classes.label} component="p" color="textSecondary" variant="overline">
                    {t('wallet_address')}
                </Typography>
                <Address address={wallet.address} />
            </Box>
            {wallet.provider !== ProviderType.Maskbook && !xsMatched ? (
                <Box paddingBottom={2} marginTop={-2}>
                    <Typography className={classes.label} component="p" color="textSecondary" variant="overline">
                        Managed by
                    </Typography>
                    <Typography className={classes.address} component="code">
                        {resolveProviderName(wallet.provider)}
                    </Typography>
                </Box>
            ) : null}
            {xsMatched ? null : (
                <ActionButton
                    size="small"
                    variant="outlined"
                    startIcon={<FileCopyOutlinedIcon />}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation()
                        copyWalletAddress(wallet.address)
                    }}>
                    {t('copy')}
                </ActionButton>
            )}
            <Box py={xsMatched ? 0 : 1} display="flex" flexWrap="wrap">
                <TokenIcon classes={{ icon: classes.coin }} address={ETH_ADDRESS} name="ETH" />
                {tokens &&
                    tokens.map((token) => (
                        <TokenIcon
                            classes={{ icon: classes.coin }}
                            key={token.address}
                            address={token.address}
                            name={token.name}
                        />
                    ))}
            </Box>
            {xsMatched ? <ChevronRightIcon className={classes.chevron} color="action" /> : null}
        </ButtonBase>
    )
}
