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
import { createRedPacketInit } from '../../plugins/Wallet/red-packet-fsm'
import {
    EthereumNetwork,
    RedPacketTokenType,
    RedPacketRecord,
    RedPacketStatus,
    RedPacketJSONPayload,
    WalletRecord,
    ERC20TokenRecord,
} from '../../database/Plugins/Wallet/types'
import { useLastRecognizedIdentity, useCurrentIdentity } from '../DataSource/useActivatedUI'
import { PortalShadowRoot } from '../../utils/jss/ShadowRootPortal'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { PluginMessageCenter } from '../../plugins/PluginMessages'
import { getActivatedUI } from '../../social-network/ui'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { debugModeSetting } from '../shared-settings/settings'
import { formatBalance } from '../../plugins/Wallet/formatter'

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
    onCreateNewPacket: (opt: createRedPacketInit) => void
}

function NewPacket(props: RedPacketDialogProps & NewPacketProps) {
    const classes = useStylesExtends(useNewPacketStyles(), props)
    const id = useCurrentIdentity()
    const [is_random, setIsRandom] = useState(0)

    const [send_message, setMsg] = useState('Best Wishes!')
    const [, msgRef] = useCapturedInput(setMsg)

    const [send_per_share, setSendPerShare] = useState(5)
    const [, perShareRef] = useCapturedInput(x => setSendPerShare(parseFloat(x)))

    const [shares, setShares] = useState(5)
    const [, sharesRef] = useCapturedInput(x => setShares(parseInt(x)))

    const rinkebyNetwork = useValueRef(debugModeSetting)

    const [selectedWalletAddress, setSelectedWallet] = React.useState<undefined | string>(undefined)
    const [selectedTokenType, setSelectedTokenType] = React.useState<
        { type: 'eth' } | { type: 'erc20'; address: string }
    >({
        type: 'eth',
    })
    const [wallets, setWallets] = React.useState<WalletRecord[]>([])
    const [tokens, setTokens] = React.useState<ERC20TokenRecord[]>([])

    const selectedWallet = wallets.find(x => x.address === selectedWalletAddress)

    const availableTokens = Array.from(selectedWallet?.erc20_token_balance || [])
        .filter(([address]) => tokens.find(x => x.address === address))
        .map(([address, amount]) => ({ amount, ...tokens.find(x => x.address === address)! }))
    const selectedToken =
        selectedTokenType.type === 'eth'
            ? undefined
            : availableTokens.find(x => x.address === selectedTokenType.address)!
    const amountPreShareMaxBigint = selectedWallet
        ? selectedTokenType.type === 'eth'
            ? selectedWallet.eth_balance
            : selectedToken?.amount
        : undefined
    const amountPreShareMaxNumber =
        typeof amountPreShareMaxBigint === 'bigint'
            ? selectedTokenType.type === 'eth'
                ? formatBalance(amountPreShareMaxBigint, 18)
                : selectedToken
                ? formatBalance(amountPreShareMaxBigint, selectedToken.decimals)
                : undefined
            : undefined

    const send_total = (is_random ? 1 : shares) * send_per_share
    const isDisabled = [
        Number.isNaN(send_total),
        send_total <= 0,
        selectedWallet === undefined,
        send_total > (amountPreShareMaxNumber || 0),
    ]
    const isSendButtonDisabled = isDisabled.some(x => x)

    React.useEffect(() => {
        const update = () =>
            Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets').then(([x, y]) => {
                setWallets(x)
                setTokens(y)
                if (selectedWalletAddress === undefined) {
                    if (x.length === 0) Services.Welcome.openOptionsPage('/wallets/error?reason=nowallet')
                    else setSelectedWallet(x[0].address)
                }
            })
        update()
        return PluginMessageCenter.on('maskbook.wallets.update', update)
    }, [selectedWalletAddress])

    const createRedPacket = async () => {
        props.onCreateNewPacket({
            duration: 60 /** seconds */ * 60 /** mins */ * 24 /** hours */,
            is_random: Boolean(is_random),
            network: rinkebyNetwork ? EthereumNetwork.Rinkeby : EthereumNetwork.Mainnet,
            send_message,
            send_total: BigInt(send_total * 10 ** (selectedTokenType.type === 'eth' ? 18 : selectedToken!.decimals)),
            sender_address: selectedWalletAddress!,
            sender_name: id?.nickname ?? 'A maskbook user',
            shares: BigInt(shares),
            token_type: selectedTokenType.type === 'eth' ? RedPacketTokenType.eth : RedPacketTokenType.erc20,
            erc20_token: selectedTokenType.type === 'eth' ? undefined : selectedTokenType.address,
        })
    }
    return (
        <div>
            {rinkebyNetwork ? <div>Debug mode, will use test rinkeby to send your red packet</div> : null}
            <br />
            <div className={classes.line}>
                <FormControl variant="filled" className={classes.input}>
                    <InputLabel>Wallet</InputLabel>
                    <Select
                        onChange={e => setSelectedWallet(e.target.value as string)}
                        MenuProps={{ container: PortalShadowRoot }}
                        value={selectedWalletAddress || ''}>
                        {wallets.map(x => (
                            <MenuItem key={x.address} value={x.address}>
                                {x.name} ({x.address})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <div className={classes.line}>
                <FormControl variant="filled" className={classes.input}>
                    <InputLabel>Token</InputLabel>
                    <Select
                        onChange={e => {
                            const v = e.target.value as string
                            if (v === 'eth') setSelectedTokenType({ type: 'eth' })
                            else setSelectedTokenType({ type: 'erc20', address: v })
                        }}
                        MenuProps={{ container: PortalShadowRoot }}
                        value={selectedTokenType.type === 'eth' ? 'eth' : selectedTokenType.address}>
                        <MenuItem key="eth" value="eth">
                            ETH
                        </MenuItem>
                        {availableTokens.map(x => (
                            <MenuItem disabled={typeof x.amount !== 'bigint'} key={x.address} value={x.address}>
                                {x.name} ({x.symbol}) (Balance:
                                {` ${
                                    typeof x.amount === 'bigint' ? formatBalance(x.amount, x.decimals) : 'Syncing...'
                                }`}
                                )
                            </MenuItem>
                        ))}
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
                    InputProps={{ inputRef: perShareRef }}
                    inputProps={{
                        min: 0,
                        max: amountPreShareMaxNumber,
                    }}
                    label={is_random ? 'Total Amount' : 'Amount per Share'}
                    variant="filled"
                    type="number"
                    defaultValue={send_per_share}
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
                    {selectedWallet
                        ? `Balance: ${
                              typeof selectedWallet.eth_balance === 'bigint'
                                  ? formatBalance(selectedWallet.eth_balance, 18)
                                  : '(Syncing...)'
                          } ETH`
                        : null}
                    <br />
                    Notice: A small gas fee will occur for publishing.
                </Typography>
                <Button
                    className={classes.button}
                    style={{ marginLeft: 'auto', minWidth: 140, whiteSpace: 'nowrap' }}
                    color="primary"
                    variant="contained"
                    disabled={isSendButtonDisabled}
                    onClick={createRedPacket}>
                    Send {isSendButtonDisabled ? '?' : send_total}{' '}
                    {selectedTokenType.type === 'eth' ? 'ETH' : selectedToken?.symbol}
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
    fakeRedPacket?: Partial<RedPacketRecord> | null
}

function ExistingPacket(props: RedPacketDialogProps & ExistingPacketProps) {
    const { onSelectExistingPacket, fakeRedPacket } = props
    const classes = useStylesExtends(useExistingPacketStyles(), props)
    const [redPacketRecords, setRedPacketRecords] = React.useState<RedPacketRecord[]>([])
    const [foundedRedPacket, setFoundedRedPacket] = React.useState<RedPacketRecord | undefined>(undefined)

    React.useEffect(() => {
        const updateHandler = () => {
            Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPackets')
                .then(packets => {
                    setFoundedRedPacket(packets.find(p => p.id === fakeRedPacket?.id))
                    return packets.filter(
                        p =>
                            p.id !== fakeRedPacket?.id &&
                            (p.status === 'normal' ||
                                p.status === 'incoming' ||
                                p.status === 'claimed' ||
                                p.status === 'pending' ||
                                p.status === 'claim_pending'),
                    )
                })
                .then(setRedPacketRecords)
        }

        updateHandler()
        return PluginMessageCenter.on('maskbook.red_packets.update', updateHandler)
    }, [fakeRedPacket])

    const insertRedPacket = (status?: RedPacketStatus | null, rpid?: RedPacketRecord['red_packet_id']) => {
        if (status === null) return onSelectExistingPacket(null)
        if (status === 'pending' || !rpid) return
        Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketByID', undefined, rpid).then(p =>
            onSelectExistingPacket(p.raw_payload),
        )
    }

    return (
        <div className={classes.wrapper}>
            {/*<Typography component="a" color="primary" className={classes.hint} onClick={() => insertRedPacket(null)}>
                Remove Red Packet from this post
    </Typography>*/}
            {!foundedRedPacket && fakeRedPacket && <RedPacketWithState redPacket={fakeRedPacket as RedPacketRecord} />}
            {foundedRedPacket && (
                <RedPacketWithState onClick={insertRedPacket} redPacket={foundedRedPacket as RedPacketRecord} />
            )}
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
    const [fakeRedPacket, setFakeRedPacket] = useState<Partial<RedPacketRecord> | null>(null)

    const createRedPacket = useCallback((opt: createRedPacketInit) => {
        Services.Plugin.invokePlugin('maskbook.red_packet', 'createRedPacket', opt).then(
            setFakeRedPacket,
            console.error,
        )
        setFakeRedPacket({
            send_message: opt.send_message,
            sender_name: opt.sender_name,
            status: 'pending' as RedPacketStatus,
        } as RedPacketRecord)
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
            p: 0,
        },
        {
            label: 'Select Existing',
            component: (
                <ExistingPacket {...props} fakeRedPacket={fakeRedPacket} onSelectExistingPacket={insertRedPacket} />
            ),
            p: 0,
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
                    <BackupRestoreTab height={400} state={[currentTab, setCurrentTab]} tabs={tabs}></BackupRestoreTab>
                </DialogContent>
            </ResponsiveDialog>
        </div>
    )
}
