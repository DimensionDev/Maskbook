import React from 'react'
import { Typography, makeStyles, createStyles, Box, Button, Avatar, ButtonBase } from '@material-ui/core'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import classNames from 'classnames'

const useStyles = makeStyles((theme) =>
    createStyles({
        container: {
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
                backgroundColor: 'var(--listSelectedIndicator)',
            },
        },
        selected: {
            '&::after': {
                opacity: 100,
                transform: 'scaleY(1)',
            },
        },
        title: {
            wordBreak: 'break-all',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
        },
        address: {
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
    onClick?(): void
}

export function WalletItem(props: WalletItemProps) {
    const classes = useStyles()
    const { wallet, selected, onClick } = props
    return (
        <ButtonBase
            component="section"
            onClick={onClick}
            className={classNames(classes.container, { [classes.selected]: selected })}>
            <Typography className={classes.title} variant="h5">
                {wallet.name}
            </Typography>
            <Box py={2}>
                <Typography component="p" color="textSecondary" variant="overline">
                    WALLET ADDRESS
                </Typography>
                <Typography className={classes.address} component="code">
                    {wallet.address}
                </Typography>
            </Box>
            <Button color="primary" size="small" variant="outlined" startIcon={<FileCopyOutlinedIcon />}>
                Copy
            </Button>
            <Box py={2} display="flex">
                <Avatar
                    className={classes.coins}
                    src="https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/assets/0x00000100F2A2bd000715001920eB70D229700085/logo.png"></Avatar>
                <Avatar
                    className={classes.coins}
                    src="https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/assets/0x00000100F2A2bd000715001920eB70D229700085/logo.png"></Avatar>
                <Avatar
                    className={classes.coins}
                    src="https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/assets/0x00000100F2A2bd000715001920eB70D229700085/logo.png"></Avatar>
            </Box>
        </ButtonBase>
    )
}
