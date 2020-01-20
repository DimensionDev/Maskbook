import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import SettingsIcon from '@material-ui/icons/Settings'
import { Divider, Menu, MenuItem, TextField } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'
import WalletLine from './WalletLine'
import ActionButton from './ActionButton'
import {
    WalletAddTokenDialog,
    WalletSendRedPacketDialog,
    WalletRedPacketHistoryDialog,
    WalletRedPacketDetailDialog,
    WalletDeleteDialog,
    WalletBackupDialog,
} from '../DashboardDialogs/Wallet'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import { useColorProvider } from '../../../utils/theme'
import { WalletRecord, RedPacketRecord, ERC20TokenRecord } from '../../../database/Plugins/Wallet/types'
import { useSnackbar } from 'notistack'
import Services from '../../service'

interface Props {
    wallet: WalletRecord
    tokens: ERC20TokenRecord[]
}

const useStyles = makeStyles(theme =>
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
    const classes = useStyles()
    const color = useColorProvider()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const [editing, setEditing] = React.useState(false)
    const [showAddToken, setShowAddToken] = React.useState(false)
    const [showSendPacket, setShowSendPacket] = React.useState(false)
    const [showRedPacketHistory, setShowRedPacketHistory] = React.useState(false)
    const [showRedPacketDetail, setShowRedPacketDetail] = React.useState<RedPacketRecord | null>(null)

    let eth_balance = ''
    {
        if (!wallet.eth_balance) eth_balance = 'Syncing...'
        else {
            const unit = BigInt('1000000000000000000')
            const main = wallet.eth_balance / unit
            const rest = wallet.eth_balance - main * unit
            eth_balance = `${main}.${rest}`
            eth_balance = eth_balance.replace(/0+$/, '') + '0'
        }
    }

    const [anchorEl, setAnchorEl] = React.useState<null | Element>(null)
    const handleClick = (event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const [renameWallet, setRenameWallet] = React.useState(false)
    type Inputable = HTMLInputElement | HTMLTextAreaElement
    const doRenameWallet = (event: React.FocusEvent<Inputable> | React.KeyboardEvent<Inputable>) => {
        event.preventDefault()
        // TODO:
        alert('dummy!')
        setRenameWallet(false)
    }

    const [deleteWallet, setDeleteWallet] = React.useState(false)

    const copyWalletAddress = () => {
        navigator.clipboard
            .writeText(wallet.address)
            .then(() =>
                enqueueSnackbar(geti18nString('dashboard_item_copied'), { variant: 'success', autoHideDuration: 1000 }),
            )
            .catch(e => {
                enqueueSnackbar(geti18nString('dashboard_item_copy_failed'), { variant: 'error' })
            })
    }

    const [backupWallet, setBackupWallet] = React.useState(false)

    return (
        <>
            <CardContent>
                <Typography className={classes.header} variant="h5" component="h2">
                    {!renameWallet ? (
                        <>
                            <span className="title">{wallet.name}</span>
                            <Typography className="fullWidth" variant="body1" component="span" color="textSecondary">
                                <SettingsIcon className={classes.cursor} fontSize="small" onClick={handleClick} />
                                <Menu
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClick={handleClose}
                                    PaperProps={{ style: { minWidth: 100 } }}
                                    onClose={handleClose}>
                                    <MenuItem onClick={() => setRenameWallet(true)}>{geti18nString('rename')}</MenuItem>
                                    <MenuItem onClick={() => setBackupWallet(true)}>
                                        {geti18nString('dashboard_create_backup')}
                                    </MenuItem>
                                    <MenuItem onClick={() => setDeleteWallet(true)} className={color.error}>
                                        {geti18nString('dashboard_delete_persona')}
                                    </MenuItem>
                                </Menu>
                            </Typography>
                        </>
                    ) : (
                        <>
                            <TextField
                                style={{ width: '100%', maxWidth: '320px' }}
                                inputProps={{ onKeyPress: e => e.key === 'Enter' && doRenameWallet(e) }}
                                autoFocus
                                variant="outlined"
                                label="Name"
                                defaultValue={wallet.name}
                                onBlur={e => doRenameWallet(e)}></TextField>
                        </>
                    )}
                </Typography>
                <WalletLine
                    line1="Wallet Address"
                    line2={wallet.address}
                    action={
                        <Typography color="primary" variant="body1" onClick={copyWalletAddress}>
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
                    line2="Ethereym"
                    action={<Typography variant="h5">{eth_balance}</Typography>}
                />
                {Array.from(wallet.erc20_token_balance).map(([addr, amount]) => {
                    const t = tokens.find(y => y.address === addr)
                    return (
                        <WalletLine
                            invert
                            line1={t?.symbol || '???'}
                            line2={t?.name || 'Unknown Token'}
                            action={
                                editing ? (
                                    <Typography className={color.error}>Delete</Typography>
                                ) : (
                                    <Typography variant="h5">{Number(amount) ?? 'Syncing...'}</Typography>
                                )
                            }
                        />
                    )
                })}
                <div className={classes.actions}>
                    <Typography
                        className={classes.cursor}
                        color="primary"
                        variant="body1"
                        onClick={() => setEditing(!editing)}>
                        {editing ? 'Done' : 'Edit List'}
                    </Typography>
                    <Typography
                        className={classes.cursor}
                        color="primary"
                        variant="body1"
                        onClick={() => setShowAddToken(true)}>
                        Add Token
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
