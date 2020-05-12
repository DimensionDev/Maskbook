import React, { useState, useCallback } from 'react'
import {
    makeStyles,
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
    DialogProps,
} from '@material-ui/core'
import { useStylesExtends, or } from '../../../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../../../components/InjectedComponents/DialogDismissIcon'
import AbstractTab from '../../../../extension/options-page/DashboardComponents/AbstractTab'
import { RedPacketWithState } from '../Dashboard/Components/RedPacket'
import Services from '../../../../extension/service'
import type { createRedPacketInit } from '../../red-packet-fsm'
import {
    EthereumNetwork,
    EthereumTokenType,
    RedPacketRecord,
    RedPacketStatus,
    RedPacketJSONPayload,
    WalletRecord,
    ERC20TokenRecord,
} from '../../database/types'
import { useCurrentIdentity } from '../../../../components/DataSource/useActivatedUI'
import { useCapturedInput } from '../../../../utils/hooks/useCapturedEvents'
import { PluginMessageCenter } from '../../../PluginMessages'
import { getActivatedUI } from '../../../../social-network/ui'
import { useValueRef } from '../../../../utils/hooks/useValueRef'
import { debugModeSetting } from '../../../../components/shared-settings/settings'
import { formatBalance } from '../../formatter'
import ShadowRootDialog from '../../../../utils/jss/ShadowRootDialog'
import { PortalShadowRoot } from '../../../../utils/jss/ShadowRootPortal'
import BigNumber from 'bignumber.js'
import { useWalletDataSource, useSelectWallet } from '../../../shared/useWallet'
import { WalletSelect } from '../../../shared/WalletSelect'
import { TokenSelect } from '../../../shared/TokenSelect'
import { RedPacketMetaKey } from '../../RedPacketMetaKey'

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
    DialogProps?: Partial<DialogProps>
}

const useNewPacketStyles = makeStyles((theme) =>
    createStyles({
        line: {
            display: 'flex',
            margin: theme.spacing(1),
        },
        input: {
            flex: 1,
            padding: theme.spacing(1),
        },
        nativeInput: {
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0,
            },
            '-moz-appearance': 'textfield',
        },
    }),
)

interface NewPacketProps {
    onCreateNewPacket: (opt: createRedPacketInit) => void
    onRequireNewWallet: () => void
    newRedPacketCreatorName?: string
    wallets: WalletRecord[] | 'loading'
    tokens: ERC20TokenRecord[]
}

function NewPacketUI(props: RedPacketDialogProps & NewPacketProps) {
    const classes = useStylesExtends(useNewPacketStyles(), props)
    const { wallets, tokens, onRequireNewWallet } = props
    const [is_random, setIsRandom] = useState(0)

    const [send_message, setMsg] = useState('Best Wishes!')
    const [, msgRef] = useCapturedInput(setMsg)

    const [send_per_share, setSendPerShare] = useState(0.01)
    const [, perShareRef] = useCapturedInput((x) => setSendPerShare(parseFloat(x)))

    const [shares, setShares] = useState(5)
    const [, sharesRef] = useCapturedInput((x) => setShares(parseInt(x)))

    const rinkebyNetwork = useValueRef(debugModeSetting)

    const useSelectWalletResult = useSelectWallet(wallets, tokens, onRequireNewWallet)
    const {
        erc20Balance,
        ethBalance,
        selectedToken,
        selectedTokenType,
        selectedWallet,
        selectedWalletAddress,
        setSelectedTokenType,
        setSelectedWallet,
        availableTokens,
    } = useSelectWalletResult

    const amountPreShareMaxBigint = selectedWallet
        ? selectedTokenType.type === 'eth'
            ? selectedWallet.eth_balance
            : selectedToken?.amount
        : undefined
    const amountPreShareMaxNumber = BigNumber.isBigNumber(amountPreShareMaxBigint)
        ? selectedTokenType.type === 'eth'
            ? formatBalance(amountPreShareMaxBigint, 18)
            : selectedToken && formatBalance(amountPreShareMaxBigint, selectedToken.decimals)
        : undefined

    const send_total = (is_random ? 1 : shares) * send_per_share
    const isDisabled = [
        Number.isNaN(send_total),
        send_total <= 0,
        selectedWallet === undefined,
        send_total > (amountPreShareMaxNumber || 0),
    ]
    const isSendButtonDisabled = isDisabled.some((x) => x)

    const createRedPacket = () => {
        const power = selectedTokenType.type === 'eth' ? 18 : selectedToken!.decimals
        props.onCreateNewPacket({
            duration: 60 /* seconds */ * 60 /* mins */ * 24 /* hours */,
            is_random: Boolean(is_random),
            network: rinkebyNetwork ? EthereumNetwork.Rinkeby : EthereumNetwork.Mainnet,
            send_message,
            send_total: new BigNumber(send_total).multipliedBy(new BigNumber(10).pow(power)),
            sender_address: selectedWalletAddress!,
            sender_name: props.newRedPacketCreatorName ?? 'Unknown User',
            shares: new BigNumber(shares),
            token_type: selectedTokenType.type === 'eth' ? EthereumTokenType.eth : EthereumTokenType.erc20,
            erc20_token: selectedTokenType.type === 'eth' ? undefined : selectedTokenType.address,
        })
    }
    return (
        <div>
            {rinkebyNetwork ? <div>Debug mode, will use test rinkeby to send your red packet</div> : null}
            <br />
            <div className={classes.line}>
                <WalletSelect
                    {...props}
                    className={classes.input}
                    useSelectWalletHooks={useSelectWalletResult}
                    wallets={wallets}></WalletSelect>
            </div>
            <div className={classes.line}>
                <TokenSelect
                    {...props}
                    className={classes.input}
                    useSelectWalletHooks={useSelectWalletResult}></TokenSelect>
                <FormControl variant="filled" className={classes.input}>
                    <InputLabel>Split Mode</InputLabel>
                    <Select
                        MenuProps={{ container: props.DialogProps?.container ?? PortalShadowRoot }}
                        value={is_random ? 1 : 0}
                        onChange={(e) => setIsRandom(e.target.value as number)}>
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
                        className: classes.nativeInput,
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
                        ? erc20Balance
                            ? `Balance: ${erc20Balance} (${ethBalance})`
                            : `Balance: ${ethBalance}`
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
                    {isSendButtonDisabled
                        ? 'Not valid'
                        : `Send ${+send_total.toFixed(3) === +send_total.toFixed(9) ? '' : '~'}${+send_total.toFixed(
                              3,
                          )} ${selectedTokenType.type === 'eth' ? 'ETH' : selectedToken?.symbol}`}
                </Button>
            </div>
        </div>
    )
}

const useExistingPacketStyles = makeStyles((theme) =>
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
    /**
     * When the red packet is created and not confirmed by the network,
     * it will not be written into the database. For UI display purpose,
     * we need to display it.
     */
    preInitialRedPacket?: Partial<RedPacketRecord> | null
    redPackets: RedPacketRecord[]
    /**
     * TODO: Might be merged with preInitialRedPacket.
     */
    justCreatedRedPacket: RedPacketRecord | undefined
}

function ExistingPacketUI(props: RedPacketDialogProps & ExistingPacketProps) {
    const { onSelectExistingPacket, preInitialRedPacket, justCreatedRedPacket, redPackets } = props
    const classes = useStylesExtends(useExistingPacketStyles(), props)

    const insertRedPacket = (status?: RedPacketStatus | null, rpid?: RedPacketRecord['red_packet_id']) => {
        if (status === null) return onSelectExistingPacket(null)
        if (status === 'pending' || !rpid) return
        Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketByID', undefined, rpid).then((p) =>
            onSelectExistingPacket(p.raw_payload),
        )
    }

    return (
        <div className={classes.wrapper}>
            {!justCreatedRedPacket && preInitialRedPacket && (
                <RedPacketWithState redPacket={preInitialRedPacket as RedPacketRecord} />
            )}
            {justCreatedRedPacket && (
                <RedPacketWithState onClick={insertRedPacket} redPacket={justCreatedRedPacket as RedPacketRecord} />
            )}
            {redPackets.map((p) => (
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

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const tabs = useState<0 | 1>(0)
    const [preInitialRedPacket, setPreInitialRedPacket] = useState<Partial<RedPacketRecord> | null>(null)

    const createRedPacket = useCallback(
        (opt: createRedPacketInit) => {
            Services.Plugin.invokePlugin('maskbook.red_packet', 'createRedPacket', opt).then(
                setPreInitialRedPacket,
                console.error,
            )
            setPreInitialRedPacket(({
                send_message: opt.send_message,
                sender_name: opt.sender_name,
                status: 'pending' as RedPacketStatus,
                erc20_token: opt.erc20_token,
                raw_payload: {
                    shares: opt.shares,
                    token: {
                        name: ' ',
                    },
                },
            } as any) as Partial<RedPacketRecord>)
            tabs[1](1)
        },
        [tabs],
    )
    const [wallets, tokens, onRequireNewWallet] = useWalletDataSource()

    const [redPacket, setRedPacket] = React.useState<RedPacketRecord[]>([])
    const [justCreatedRedPacket, setJustCreatedRedPacket] = React.useState<RedPacketRecord | undefined>(undefined)
    React.useEffect(() => {
        const updateHandler = () => {
            Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPackets')
                .then((packets) => {
                    setJustCreatedRedPacket(packets.find((p) => p.id === preInitialRedPacket?.id))
                    return packets.filter(
                        (p) =>
                            p.id !== preInitialRedPacket?.id &&
                            p.create_transaction_hash &&
                            (p.status === 'normal' ||
                                p.status === 'incoming' ||
                                p.status === 'claimed' ||
                                p.status === 'pending' ||
                                p.status === 'claim_pending'),
                    )
                })
                .then(setRedPacket)
        }

        updateHandler()
        return PluginMessageCenter.on('maskbook.red_packets.update', updateHandler)
    }, [preInitialRedPacket])

    const insertRedPacket = (payload?: RedPacketJSONPayload | null) => {
        const ref = getActivatedUI().typedMessageMetadata
        const next = new Map(ref.value.entries())
        payload ? next.set(RedPacketMetaKey, payload) : next.delete(RedPacketMetaKey)
        ref.value = next
        props.onConfirm(payload)
    }

    return (
        <RedPacketDialogUI
            {...props}
            tab={tabs}
            onRequireNewWallet={onRequireNewWallet}
            newRedPacketCreatorName={useCurrentIdentity()?.linkedPersona?.nickname}
            wallets={wallets}
            tokens={tokens}
            justCreatedRedPacket={justCreatedRedPacket}
            redPackets={redPacket}
            onCreateNewPacket={createRedPacket}
            onSelectExistingPacket={insertRedPacket}
            preInitialRedPacket={preInitialRedPacket}
        />
    )
}

export function RedPacketDialogUI(
    props: RedPacketDialogProps & NewPacketProps & ExistingPacketProps & { tab?: [0 | 1, (next: 0 | 1) => void] },
) {
    const classes = useStylesExtends(useStyles(), props)
    const [currentTab, setCurrentTab] = or(props.tab, useState<0 | 1>(0)) as [
        number,
        React.Dispatch<React.SetStateAction<number>>,
    ]

    const tabs = [
        {
            label: 'Create New',
            component: <NewPacketUI {...props} />,
            p: 0,
        },
        {
            label: 'Select Existing',
            component: <ExistingPacketUI {...props} />,
            p: 0,
        },
    ]
    return (
        <ShadowRootDialog
            className={classes.dialog}
            classes={{
                container: classes.container,
                paper: classes.paper,
            }}
            open={props.open}
            scroll="paper"
            fullWidth
            maxWidth="sm"
            disableAutoFocus
            disableEnforceFocus
            BackdropProps={{
                className: classes.backdrop,
            }}
            {...props.DialogProps}>
            <DialogTitle className={classes.header}>
                <IconButton classes={{ root: classes.close }} onClick={props.onDecline}>
                    <DialogDismissIconUI />
                </IconButton>
                <Typography className={classes.title} display="inline" variant="inherit">
                    Plugin: Red Packet
                </Typography>
            </DialogTitle>
            <DialogContent className={classes.content}>
                <AbstractTab height={400} state={[currentTab, setCurrentTab]} tabs={tabs}></AbstractTab>
            </DialogContent>
        </ShadowRootDialog>
    )
}
