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
import { RedPacket, RedPacketWithState } from '../../extension/options-page/DashboardComponents/RedPacket'
import Services from '../../extension/service'
import { createRedPacketInit, createRedPacketOption } from '../../plugins/Wallet/red-packet-fsm'
import {
    EthereumNetwork,
    RedPacketTokenType,
    RedPacketRecord,
    RedPacketStatus,
    RedPacketJSONPayload,
} from '../../database/Plugins/Wallet/types'
import { useLastRecognizedIdentity, useCurrentIdentity } from '../DataSource/useActivatedUI'
import { PortalShadowRoot } from '../../utils/jss/ShadowRootPortal'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { PluginMessageCenter } from '../../plugins/PluginMessages'
import { getActivatedUI } from '../../social-network/ui'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { debugModeSetting } from '../shared-settings/settings'

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
    onConfirm: (opt?: RedPacketJSONPayload | null) => void
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

interface NewPacketProps {
    onCreateNewPacket: (opt: createRedPacketInit & createRedPacketOption) => void
}

function NewPacket(props: RedPacketDialogProps & NewPacketProps) {
    const classes = useStylesExtends(useNewPacketStyles(), props)
    const id = useCurrentIdentity()
    const [is_random, setIsRandom] = useState(0)

    const [send_message, setMsg] = useState('Best Wishes!')
    const [, msgRef] = useCapturedInput(setMsg)

    const [send_pre_share, setTotal] = useState(5)
    const [, totalRef] = useCapturedInput(x => setTotal(parseInt(x)))

    const [shares, setShares] = useState(5)
    const [, sharesRef] = useCapturedInput(x => setShares(parseInt(x)))

    const send_total = shares * send_pre_share
    const isSendTotalLegal = Number.isNaN(send_total) || send_total <= 0

    const rinkebyNetwork = useValueRef(debugModeSetting)

    const createRedPacket = () =>
        props.onCreateNewPacket({
            duration: 60 /** seconds */ * 60 /** mins */ * 24 /** hours */,
            is_random: Boolean(is_random),
            network: rinkebyNetwork ? EthereumNetwork.Rinkeby : EthereumNetwork.Mainnet,
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
            {rinkebyNetwork ? <div>Debug mode, will use test rinkeby to send your red packet</div> : null}
            <br />
            <div className={classes.line}>
                <FormControl variant="filled" className={classes.input}>
                    <InputLabel>Token</InputLabel>
                    <Select MenuProps={{ container: PortalShadowRoot }} value={10}>
                        <MenuItem key={10} value={10}>
                            ETH
                        </MenuItem>
                        <MenuItem key={20} value={20}>
                            USDT
                        </MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="filled" className={classes.input}>
                    <InputLabel>Split Mode</InputLabel>
                    <Select
                        MenuProps={{ container: PortalShadowRoot }}
                        value={is_random ? 1 : 0}
                        onChange={e => setIsRandom(e.target.value as number)}>
                        <MenuItem value={0}>Average</MenuItem>
                        <MenuItem value={1}>Random</MenuItem>
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
                    {
                        // TODO: balance
                    }
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

interface ExistingPacketProps {
    onSelectExistingPacket(opt?: RedPacketJSONPayload | null): void
}

function ExistingPacket(props: RedPacketDialogProps & ExistingPacketProps) {
    const { onSelectExistingPacket } = props
    const classes = useStylesExtends(useExistingPacketStyles(), props)
    const [redPacketRecords, setRedPacketRecords] = React.useState<RedPacketRecord[]>([])

    React.useEffect(() => {
        const updateHandler = () => {
            Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPackets')
                .then(packets =>
                    packets.filter(
                        p =>
                            p.status === 'normal' ||
                            p.status === 'incoming' ||
                            p.status === 'claimed' ||
                            p.status === 'pending' ||
                            p.status === 'claim_pending',
                    ),
                )
                .then(setRedPacketRecords)
        }

        updateHandler()
        return PluginMessageCenter.on('maskbook.red_packets.update', updateHandler)
    }, [])

    const insertRedPacket = (status?: RedPacketStatus | null, rpid?: RedPacketRecord['red_packet_id']) => {
        if (status === null) return onSelectExistingPacket(null)
        if (status === 'pending' || !rpid) return
        Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketByID', undefined, rpid).then(p =>
            onSelectExistingPacket(p.raw_payload),
        )
    }

    return (
        <div className={classes.wrapper}>
            <Typography component="a" color="primary" className={classes.hint} onClick={() => insertRedPacket(null)}>
                Remove Red Packet from this post
            </Typography>
            {redPacketRecords.map(p => (
                <RedPacketWithState onClick={insertRedPacket} key={p.id} redPacket={p} />
            ))}
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
        Services.Plugin.invokePlugin('maskbook.red_packet', 'createRedPacket', rest, { shares }).then(
            console.log,
            console.error,
        )
        setCurrentTab(1)
    }, [])

    const insertRedPacket = (payload?: RedPacketJSONPayload | null) => {
        const ref = getActivatedUI().typedMessageMetadata
        const next = new Map(ref.value.entries())
        payload ? next.set('com.maskbook.red_packet:1', payload) : next.delete('com.maskbook.red_packet:1')
        ref.value = next
        props.onConfirm(payload)
    }

    const tabs = [
        {
            label: 'Create New',
            component: <NewPacket {...props} onCreateNewPacket={createRedPacket} />,
        },
        {
            label: 'Select Existing',
            component: <ExistingPacket {...props} onSelectExistingPacket={insertRedPacket} />,
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
