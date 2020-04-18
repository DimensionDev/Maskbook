import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import SettingsIcon from '@material-ui/icons/Settings'
import { Divider, Menu, MenuItem, TextField } from '@material-ui/core'
import { useI18N } from '../../../../../utils/i18n-next-ui'
import WalletLine from './WalletLine'
import ActionButton from '../../../../../extension/options-page/DashboardComponents/ActionButton'
import {
    WalletAddTokenDialog,
    WalletSendRedPacketDialog,
    WalletRedPacketHistoryDialog,
    WalletRedPacketDetailDialog,
    WalletDeleteDialog,
    WalletBackupDialog,
} from '../Dialogs/Wallet'
import { DialogRouter } from '../../../../../extension/options-page/DashboardDialogs/DialogBase'
import { useColorProvider } from '../../../../../utils/theme'
import type { WalletRecord, RedPacketRecord, ERC20TokenRecord } from '../../../database/types'
import { useSnackbar } from 'notistack'
import Services from '../../../../../extension/service'
import { formatBalance } from '../../../formatter'
import BigNumber from 'bignumber.js'

interface Props {
    wallet: WalletRecord & { privateKey: string }
    tokens: ERC20TokenRecord[]
}

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            width: '100%',
        },
        focus: {
            margin: '-5px',
        },
        header: {
            display: 'flex',
            alignItems: 'flex-end',
            '& > .title': {
                marginRight: theme.spacing(1),
                flexGrow: 1,
                overflow: 'hidden',
            },
            '& > .extra-item': {
                visibility: 'hidden',
                cursor: 'pointer',
                fontSize: '0.8rem',
            },
            '&:hover': {
                '& > .extra-item': {
                    visibility: 'visible',
                },
            },
        },
        actions: {
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(1),
            '&:last-child': {
                paddingBottom: 0,
            },
        },
        cursor: {
            cursor: 'pointer',
        },
    }),
)

export default function WalletCard({ wallet, tokens }: Props) {
    const { t } = useI18N()
    const classes = useStyles()
    const color = useColorProvider()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const [editing, setEditing] = React.useState(false)
    const [showAddToken, setShowAddToken] = React.useState(false)
    const [showSendPacket, setShowSendPacket] = React.useState(false)
    const [showRedPacketHistory, setShowRedPacketHistory] = React.useState(false)
    const [showRedPacketDetail, setShowRedPacketDetail] = React.useState<RedPacketRecord | null>(null)

    const [anchorEl, setAnchorEl] = React.useState<null | Element>(null)
    const handleClick = (event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const setAsDefault = () => Services.Plugin.invokePlugin('maskbook.wallet', 'setDefaultWallet', wallet.address)

    const [renameWallet, setRenameWallet] = React.useState(false)
    type Inputable = HTMLInputElement | HTMLTextAreaElement
    const doRenameWallet = (event: React.FocusEvent<Inputable> | React.KeyboardEvent<Inputable>) => {
        event.preventDefault()
        const name = event.currentTarget.value.trim()

        if (!name) {
            setRenameWallet(false)
            return
        }
        Services.Plugin.invokePlugin('maskbook.wallet', 'renameWallet', wallet.address, name).then(() =>
            setRenameWallet(false),
        )
    }

    const [deleteWallet, setDeleteWallet] = React.useState(false)

    const copyWalletAddress = () => {
        navigator.clipboard
            .writeText(wallet.address)
            .then(() => enqueueSnackbar(t('dashboard_item_copied'), { variant: 'success', autoHideDuration: 1000 }))
            .catch((e) => {
                enqueueSnackbar(t('dashboard_item_copy_failed'), { variant: 'error' })
            })
    }

    const [backupWallet, setBackupWallet] = React.useState(false)

    return (
        <>
            <CardContent>
                <Typography className={classes.header} variant="h5" component="h2">
                    {!renameWallet ? (
                        <>
                            <span className="title">
                                {wallet.name}
                                {wallet._wallet_is_default && `(${t('default')})`}
                            </span>
                            <Typography className="fullWidth" variant="body1" component="span" color="textSecondary">
                                <SettingsIcon className={classes.cursor} fontSize="small" onClick={handleClick} />
                                <Menu
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClick={handleClose}
                                    PaperProps={{ style: { minWidth: 100 } }}
                                    onClose={handleClose}>
                                    <MenuItem disabled={wallet._wallet_is_default} onClick={setAsDefault}>
                                        {t('set_as_default')}
                                    </MenuItem>
                                    <MenuItem onClick={() => setRenameWallet(true)}>{t('rename')}</MenuItem>
                                    <MenuItem onClick={() => setBackupWallet(true)}>{t('backup')}</MenuItem>
                                    <MenuItem onClick={() => setDeleteWallet(true)} className={color.error}>
                                        {t('delete')}
                                    </MenuItem>
                                </Menu>
                            </Typography>
                        </>
                    ) : (
                        <>
                            <TextField
                                style={{ width: '100%', maxWidth: '320px' }}
                                inputProps={{ onKeyPress: (e) => e.key === 'Enter' && doRenameWallet(e) }}
                                autoFocus
                                variant="outlined"
                                label="Name"
                                defaultValue={wallet.name}
                                onBlur={(e) => doRenameWallet(e)}></TextField>
                        </>
                    )}
                </Typography>
                <WalletLine
                    line1={t('wallet_address')}
                    line2={wallet.address}
                    action={
                        <Typography
                            className={classes.cursor}
                            color="primary"
                            variant="body1"
                            onClick={copyWalletAddress}>
                            Copy
                        </Typography>
                    }
                />
                <div className={classes.actions}>
                    <Typography
                        className={classes.cursor}
                        color="primary"
                        variant="body1"
                        onClick={() => setShowRedPacketHistory(true)}>
                        Red Packets History...
                    </Typography>
                    <ActionButton variant="contained" color="primary" onClick={() => setShowSendPacket(true)}>
                        Send Red Packet
                    </ActionButton>
                </div>
                <WalletLine
                    invert
                    line1="ETH"
                    line2="Ethereum"
                    action={
                        <Typography variant="h5">{formatBalance(wallet.eth_balance, 18) ?? 'Syncing...'}</Typography>
                    }
                />
                {Array.from(wallet.erc20_token_balance).map(([addr, amount]) => {
                    const t = tokens.find((y) => y.address === addr)
                    return (
                        <WalletLine
                            key={addr}
                            invert
                            line1={t?.symbol || '???'}
                            line2={t?.name || 'Unknown Token'}
                            action={
                                editing ? (
                                    <></>
                                ) : (
                                    <Typography variant="h5">
                                        {BigNumber.isBigNumber(amount)
                                            ? t
                                                ? formatBalance(amount, t.decimals ?? 18)
                                                : 'Unknown'
                                            : 'Syncing...'}
                                    </Typography>
                                )
                            }
                        />
                    )
                })}
                <div className={classes.actions}>
                    {false ? (
                        <Typography
                            className={classes.cursor}
                            color="primary"
                            variant="body1"
                            onClick={() => setEditing(!editing)}>
                            {editing ? 'Done' : 'Edit List'}
                        </Typography>
                    ) : (
                        <span />
                    )}
                    <Typography
                        className={classes.cursor}
                        color="primary"
                        variant="body1"
                        onClick={() => setShowAddToken(true)}>
                        {t('add_token')}
                    </Typography>
                </div>
            </CardContent>
            <Divider />
            {showAddToken && (
                <DialogRouter
                    onExit={() => setShowAddToken(false)}
                    children={
                        <WalletAddTokenDialog
                            onConfirm={(token, user, network) => {
                                setShowAddToken(false)
                                Services.Plugin.invokePlugin(
                                    'maskbook.wallet',
                                    'walletAddERC20Token',
                                    wallet.address,
                                    network,
                                    token,
                                    user,
                                )
                            }}
                            onDecline={() => setShowAddToken(false)}
                        />
                    }
                />
            )}
            {showSendPacket && (
                <DialogRouter
                    onExit={() => setShowSendPacket(false)}
                    children={<WalletSendRedPacketDialog onDecline={() => setShowSendPacket(false)} />}
                />
            )}
            {showRedPacketHistory && (
                <DialogRouter
                    onExit={() => setShowRedPacketHistory(false)}
                    children={
                        <WalletRedPacketHistoryDialog
                            walletAddress={wallet.address}
                            onClick={setShowRedPacketDetail}
                            onDecline={() => setShowRedPacketHistory(false)}
                        />
                    }
                />
            )}
            {showRedPacketDetail && (
                <DialogRouter
                    onExit={() => setShowRedPacketDetail(null)}
                    children={
                        <WalletRedPacketDetailDialog
                            redPacket={showRedPacketDetail}
                            onDecline={() => setShowRedPacketDetail(null)}
                        />
                    }
                />
            )}
            {backupWallet && (
                <DialogRouter
                    onExit={() => setBackupWallet(false)}
                    children={<WalletBackupDialog wallet={wallet} onDecline={() => setBackupWallet(false)} />}
                />
            )}
            {deleteWallet && (
                <DialogRouter
                    onExit={() => setDeleteWallet(false)}
                    children={
                        <WalletDeleteDialog
                            wallet={wallet}
                            onConfirm={() => setDeleteWallet(false)}
                            onDecline={() => setDeleteWallet(false)}
                        />
                    }
                />
            )}
        </>
    )
}
