import React from 'react'
import { Typography, makeStyles, createStyles, Box, Button, Avatar, ButtonBase } from '@material-ui/core'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import type { WalletRecord, ERC20TokenRecord } from '../../../plugins/Wallet/database/types'
import classNames from 'classnames'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useSnackbarCallback } from '../Dialogs/Base'
import { DebounceButton } from './ActionButton'

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
        },
        label: {
            color: theme.palette.text.secondary,
            fontWeight: 500,
        },
        address: {
            color: theme.palette.text.primary,
            fontFamily: 'var(--monospace)',
            wordBreak: 'break-all',
        },
        coins: {
            width: '16px',
            height: '16px',
            marginRight: theme.spacing(1),
        },
    }),
)

interface WalletItemProps {
    wallet: Partial<WalletRecord>
    selected?: boolean
    tokens?: ERC20TokenRecord[]
    onClick?(): void
}

export function WalletItem(props: WalletItemProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { wallet, selected, onClick, tokens } = props
    const [, copyToClipboard] = useCopyToClipboard()
    const copyWalletAddress = useSnackbarCallback(async (address: string) => copyToClipboard(address), [])
    return (
        <ButtonBase
            component="section"
            onClick={onClick}
            className={classNames(classes.container, {
                [classes.selected]: selected,
                [classes.default]: wallet._wallet_is_default,
            })}>
            <Typography className={classes.title} variant="h5">
                {wallet.name}
            </Typography>
            <Box py={2}>
                <Typography className={classes.label} component="p" color="textSecondary" variant="overline">
                    {t('wallet_address')}
                </Typography>
                <Typography className={classes.address} component="code">
                    {wallet.address}
                </Typography>
            </Box>
            {/* Prevent the event to make the whole card ripple */}
            <span onMouseDown={(e) => e.stopPropagation()}>
                <DebounceButton
                    color="primary"
                    size="small"
                    variant="outlined"
                    startIcon={<FileCopyOutlinedIcon />}
                    onClick={() => copyWalletAddress(wallet.address)}>
                    {t('copy')}
                </DebounceButton>
            </span>
            <Box py={2} display="flex">
                {tokens &&
                    tokens.map((token) => (
                        <Avatar
                            key={token.address}
                            className={classes.coins}
                            src={`https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/assets/${token.address}/logo.png`}>
                            {token.name?.substr(0, 1).toLocaleUpperCase()}
                        </Avatar>
                    ))}
            </Box>
        </ButtonBase>
    )
}
