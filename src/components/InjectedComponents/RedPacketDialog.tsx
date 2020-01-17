import React, { useRef, useState, useCallback } from 'react'
import {
    makeStyles,
    withMobileDialog,
    Dialog,
    DialogTitle,
    IconButton,
    Button,
    DialogContent,
    Typography,
    FormControl,
    TextField,
    createStyles,
    InputLabel,
    Select,
    MenuItem,
} from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import { DialogDismissIconUI } from './DialogDismissIcon'
import BackupRestoreTab from '../../extension/options-page/DashboardComponents/BackupRestoreTab'
import { RedPacket } from '../../extension/options-page/DashboardComponents/RedPacket'
import Services from '../../extension/service'
import { createRedPacketInit, createRedPacketOption } from '../../plugins/Wallet/red-packet-fsm'
import { EthereumNetwork, RedPacketTokenType } from '../../database/Plugins/Wallet/types'
import { useLastRecognizedIdentity, useCurrentIdentity } from '../DataSource/useActivatedUI'
import { PortalShadowRoot } from '../../utils/jss/ShadowRootPortal'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'

interface RedPacketDialogProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'input'
        | 'header'
        | 'content'
        | 'actions'
        | 'close'
        | 'button'
        | 'label'
        | 'switch'
    > {
    open: boolean
    onConfirm: (opt: createRedPacketInit & createRedPacketOption) => void
    onDecline: () => void
}

const useNewPacketStyles = makeStyles(theme =>
    createStyles({
        line: {
            display: 'flex',
            margin: theme.spacing(1),
        },
        input: {
            flex: 1,
            padding: theme.spacing(1),
        },
    }),
)

function NewPacket(props: RedPacketDialogProps) {
    const classes = useStylesExtends(useNewPacketStyles(), props)
    const id = useCurrentIdentity()
    const [is_random, setIsRandom] = useState(true)

    const [send_message, setMsg] = useState('Best Wishes!')
    const [, msgRef] = useCapturedInput(setMsg)

    const [send_pre_share, setTotal] = useState(5)
    const [, totalRef] = useCapturedInput(x => setTotal(parseInt(x)))

    const [shares, setShares] = useState(5)
    const [, sharesRef] = useCapturedInput(x => setShares(parseInt(x)))

    const send_total = shares * send_pre_share
    const isSendTotalLegal = Number.isNaN(send_total) || send_total <= 0

    const createRedPacket = () =>
        props.onConfirm({
            duration: 60 /** seconds */ * 60 /** mins */ * 24 /** hours */,
            is_random,
            // TODO: Select network in debug mode?
            network: EthereumNetwork.Rinkeby,
            send_message,
            send_total: BigInt(send_total),
            // TODO: fill with wallet address
            sender_address: '0x???',
            // TODO: a better default?
            sender_name: id?.nickname ?? 'A maskbook user',
            shares: BigInt(shares),
            // TODO: support erc20
            token_type: RedPacketTokenType.eth,
        })
    return (
        <div>
            <div className={classes.line}>
                <FormControl variant="filled" className={classes.input}>
                    <InputLabel>Token</InputLabel>
                    <Select MenuProps={{ container: PortalShadowRoot }} value={10}>
                        <MenuItem key={10} value={10}>
                            USDT
                        </MenuItem>
                        <MenuItem key={20} value={20}>
                            SDTU
                        </MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="filled" className={classes.input}>
                    <InputLabel>Split Mode</InputLabel>
                    <Select
                        MenuProps={{ container: PortalShadowRoot }}
                        value={is_random ? 1 : 0}
                        onChange={e => setIsRandom(!!e.currentTarget.value)}>
                        <MenuItem value="0">Average</MenuItem>
                        <MenuItem value="1">Random</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <div className={classes.line}>
                <TextField
                    className={classes.input}
                    InputProps={{ inputRef: totalRef }}
                    inputProps={{ min: 1 }}
                    label="Amount per Share"
                    variant="filled"
                    type="number"
                    defaultValue={send_pre_share}
                />
                <TextField
                    className={classes.input}
                    InputProps={{ inputRef: sharesRef }}
                    inputProps={{ min: 1 }}
                    label="Shares"
                    variant="filled"
                    type="number"
                    defaultValue={shares}
                />
            </div>
            <div className={classes.line}>
                <TextField
                    className={classes.input}
                    InputProps={{ inputRef: msgRef }}
                    label="Attached Message"
                    variant="filled"
                    defaultValue="Best Wishes!"
                />
            </div>
            <div className={classes.line}>
                <Typography variant="body2">
                    Balance: 2.5 USDT (with 0.01 ETH) <br />
                    Notice: A small gas fee will occur for publishing.
                </Typography>
                <Button
                    className={classes.button}
                    style={{ marginLeft: 'auto', width: 140 }}
                    color="primary"
                    variant="contained"
                    disabled={isSendTotalLegal}
                    onClick={createRedPacket}>
                    Send {isSendTotalLegal ? '?' : send_total} USDT
                </Button>
            </div>
        </div>
    )
}

const useExistingPacketStyles = makeStyles(theme =>
    createStyles({
        wrapper: {
            display: 'flex',
            width: 400,
            flexDirection: 'column',
            overflow: 'auto',
            margin: `${theme.spacing(1)}px auto`,
        },
        hint: {
            padding: theme.spacing(0.5, 1),
            border: `1px solid ${theme.palette.background.default}`,
            borderRadius: theme.spacing(1),
            margin: 'auto',
            cursor: 'pointer',
        },
    }),
)

function ExistingPacket(props: RedPacketDialogProps) {
    const classes = useStylesExtends(useExistingPacketStyles(), props)
    return (
        <div className={classes.wrapper}>
            <Typography component="a" color="primary" className={classes.hint}>
                Remove Red Packet from this post
            </Typography>
            <RedPacket />
            <RedPacket />
            <RedPacket />
        </div>
    )
}

const useStyles = makeStyles({
    MUIInputRoot: {
        minHeight: 108,
        flexDirection: 'column',
        padding: 10,
        boxSizing: 'border-box',
    },
    MUIInputInput: {
        fontSize: 18,
        minHeight: '8em',
    },
    title: {
        marginLeft: 6,
    },
    actions: {
        paddingLeft: 26,
    },
    container: {
        width: '100%',
    },
})
const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = useRef<HTMLDivElement>(null)
    const [currentTab, setCurrentTab] = useState(0)

    const createRedPacket = useCallback((opt: createRedPacketInit & createRedPacketOption) => {
        const { shares, ...rest } = opt
        Services.Plugin.invokePlugin(
            'maskbook.red_packet',
            'createRedPacket',
            rest,
            { shares },
            // TODO: UI switch to another board
        ).then(console.log, console.error)
        setCurrentTab(1)
    }, [])

    const tabs = [
        {
            label: 'Create New',
            component: <NewPacket {...props} onConfirm={createRedPacket} />,
        },
        {
            label: 'Select Existing',
            component: <ExistingPacket {...props} />,
        },
    ]

    return (
        <div ref={rootRef}>
            <ResponsiveDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
                open={props.open}
                scroll="paper"
                fullWidth
                maxWidth="sm"
                container={() => rootRef.current}
                disablePortal
                disableAutoFocus
                disableEnforceFocus
                BackdropProps={{
                    className: classes.backdrop,
                }}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={props.onDecline}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={classes.title} display="inline" variant="inherit">
                        Plugin: Red Packet
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <BackupRestoreTab height={292} state={[currentTab, setCurrentTab]} tabs={tabs}></BackupRestoreTab>
                </DialogContent>
            </ResponsiveDialog>
        </div>
    )
}
