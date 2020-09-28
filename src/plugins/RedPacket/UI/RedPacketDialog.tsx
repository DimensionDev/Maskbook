import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react'
import {
    makeStyles,
    DialogTitle,
    IconButton,
    DialogContent,
    Typography,
    FormControl,
    TextField,
    createStyles,
    InputLabel,
    Select,
    MenuItem,
    DialogProps,
    Box,
} from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../../components/InjectedComponents/DialogDismissIcon'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import { RedPacketWithState } from './RedPacket'
import Services from '../../../extension/service'
import type { RedPacketRecord, RedPacketJSONPayload } from '../types'
import { RedPacketStatus } from '../types'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { useCapturedInput } from '../../../utils/hooks/useCapturedEvents'
import { PluginMessageCenter } from '../../PluginMessages'
import { getActivatedUI } from '../../../social-network/ui'
import { formatBalance } from '../../Wallet/formatter'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { PortalShadowRoot } from '../../../utils/shadow-root/ShadowRootPortal'
import BigNumber from 'bignumber.js'
import { RedPacketMetaKey, RED_PACKET_MIN_SHARES, RED_PACKET_MAX_SHARES, RED_PACKET_CONSTANTS } from '../constants'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { Token } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainId'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { createEetherToken } from '../../../web3/helpers'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useTokenApproveCallback, ApproveState } from '../../../web3/hooks/useTokenApproveCallback'
import { useCreateRedPacketCallback } from '../hooks/useCreateRedPacketCallback'
import { TransactionDialog } from '../../../web3/UI/TransactionDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useBlockNumber } from '../../../web3/hooks/useBlockNumber'

//#region new red packet
const useNewPacketStyles = makeStyles((theme) =>
    createStyles({
        line: {
            display: 'flex',
            margin: theme.spacing(1),
        },
        bar: {
            padding: theme.spacing(0, 2, 2),
        },
        input: {
            flex: 1,
            padding: theme.spacing(1),
        },
        tip: {
            fontSize: 12,
            color: theme.palette.text.secondary,
        },
    }),
)

interface NewPacketProps {
    onCreate?(): void
}

function NewPacketUI(props: RedPacketDialogProps & NewPacketProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useNewPacketStyles(), props)

    const { onCreate } = props

    // context
    const account = useAccount()
    const chainId = useChainId()

    //#region select token
    const [token, setToken] = useState<Token>(createEetherToken(chainId))
    const [openSelectERC20TokenDialog, setOpenSelectERC20TokenDialog] = useState(false)
    const onTokenChipClick = useCallback(() => {
        setOpenSelectERC20TokenDialog(true)
    }, [])
    const onSelectERC20TokenDialogClose = useCallback(() => {
        setOpenSelectERC20TokenDialog(false)
    }, [])
    const onSelectERC20TokenDialogSubmit = useCallback(
        (token: Token) => {
            setToken(token)
            onSelectERC20TokenDialogClose()
        },
        [onSelectERC20TokenDialogClose],
    )
    //#endregion

    //#region packet settings
    // is random
    const [isRandom, setIsRandom] = useState(0)

    // message
    const [message, setMessage] = useState('Best Wishes!')
    const [, messageRef] = useCapturedInput(setMessage)

    // sender name
    const senderName = useCurrentIdentity()?.linkedPersona?.nickname ?? 'Unknown User'

    // shares
    const [shares, setShares] = useState<number | ''>(5)
    const [, sharesRef] = useCapturedInput()
    const onShareChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const shares_ = ev.currentTarget.value.replace(/[,\.]/g, '')
        if (shares_ === '') setShares('')
        else if (/^[1-9]+\d*$/.test(shares_)) setShares(Number.parseInt(shares_))
    }, [])

    // amount
    const [amount, setAmount] = useState('0')
    const totalAmount = isRandom ? new BigNumber(amount) : new BigNumber(amount).multipliedBy(shares || '0')

    // balance
    const { value: tokenBalance = '0', error, loading: loadingTokenBalance } = useTokenBalance(token)

    if (error) {
        console.log('DEBUG: token balance error')
        console.log(error)
    }
    //#endregion

    //#region approve ERC20
    const HappyRedPacketContractAddress = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS')
    const [approveState, approveCallback] = useTokenApproveCallback(token, amount, HappyRedPacketContractAddress)
    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveState])
    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING
    //#endregion

    //#region blocking
    const [createRedPacketState, createRedPacketCallback] = useCreateRedPacketCallback({
        duration: 60 /* seconds */ * 60 /* mins */ * 24 /* hours */,
        isRandom: Boolean(isRandom),
        name: senderName,
        message,
        shares: shares || 0,
        token,
        total: totalAmount.toFixed(),
    })
    const [openTransactionDialog, setOpenTransactionDialog] = useState(false)
    const onSubmit = useCallback(async () => {
        setOpenTransactionDialog(true)
        await createRedPacketCallback()
    }, [createRedPacketCallback])
    const onTransactionDialogClose = useCallback(() => {
        setOpenTransactionDialog(false)
        if (createRedPacketState.type !== TransactionStateType.SUCCEED) return
        setAmount('0')
        onCreate?.()
    }, [createRedPacketState, onCreate])
    //#endregion

    const validationMessage = useMemo(() => {
        if (!account) return 'Connect a Wallet'
        if (!token.address) return 'Select a token'
        if (new BigNumber(shares || '0').isZero()) return 'Enter shares'
        if (new BigNumber(amount).isZero()) return 'Enter an amount'
        if (new BigNumber(amount).isGreaterThan(new BigNumber(tokenBalance)))
            return `Insufficient ${token.symbol} balance`
        return ''
    }, [account, amount, shares, token, tokenBalance])

    return (
        <>
            <EthereumStatusBar classes={{ root: classes.bar }} />
            <div className={classes.line}>
                <FormControl className={classes.input} variant="outlined">
                    <InputLabel>{t('plugin_red_packet_split_mode')}</InputLabel>
                    <Select
                        value={isRandom ? 1 : 0}
                        onChange={(e) => setIsRandom(e.target.value as number)}
                        MenuProps={{ container: props.DialogProps?.container ?? PortalShadowRoot }}>
                        <MenuItem value={0}>{t('plugin_red_packet_average')}</MenuItem>
                        <MenuItem value={1}>{t('plugin_red_packet_random')}</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    className={classes.input}
                    InputProps={{
                        inputRef: sharesRef,
                        inputProps: {
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            min: RED_PACKET_MIN_SHARES,
                            max: RED_PACKET_MAX_SHARES,
                            placeholder: '0',
                            pattern: '^[0-9]$',
                            spellCheck: false,
                        },
                    }}
                    InputLabelProps={{ shrink: true }}
                    label={t('plugin_red_packet_shares')}
                    value={shares}
                    variant="outlined"
                    onChange={onShareChange}
                />
            </div>
            <div className={classes.line}>
                <TokenAmountPanel
                    classes={{ root: classes.input }}
                    label={isRandom ? 'Total Amount' : 'Amount per Share'}
                    amount={amount}
                    balance={tokenBalance}
                    token={token}
                    onAmountChange={setAmount}
                    SelectTokenChip={{
                        loading: loadingTokenBalance,
                        ChipProps: {
                            onClick: onTokenChipClick,
                        },
                    }}
                />
            </div>
            <div className={classes.line}>
                <TextField
                    className={classes.input}
                    InputProps={{ inputRef: messageRef }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ placeholder: t('plugin_red_packet_best_wishes') }}
                    label={t('plugin_red_packet_attached_message')}
                    variant="outlined"
                    defaultValue={t('plugin_red_packet_best_wishes')}
                />
            </div>
            <Box className={classes.line} display="flex" alignItems="center">
                {approveRequired ? (
                    <ActionButton
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={approveState === ApproveState.PENDING}
                        onClick={onApprove}>
                        {approveState === ApproveState.NOT_APPROVED ? `Approve ${token.symbol}` : ''}
                        {approveState === ApproveState.PENDING ? `Approve... ${token.symbol}` : ''}
                    </ActionButton>
                ) : (
                    <ActionButton
                        className={classes.button}
                        style={{ marginLeft: 'auto', minWidth: 140, whiteSpace: 'nowrap' }}
                        variant="contained"
                        // disabled={Boolean(validationMessage)}
                        disabled
                        onClick={onSubmit}>
                        {validationMessage || `Send ${formatBalance(totalAmount, token.decimals)} ${token.symbol}`}
                    </ActionButton>
                )}
            </Box>
            <SelectERC20TokenDialog
                open={openSelectERC20TokenDialog}
                excludeTokens={[token.address]}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
            <TransactionDialog
                state={createRedPacketState}
                summary={`Creating ${formatBalance(new BigNumber(amount), token.decimals)} ${token.symbol}`}
                open={openTransactionDialog}
                onClose={onTransactionDialogClose}
            />
        </>
    )
}
//#endregion

//#region existing red packet
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
    onSelect?: (payload: RedPacketJSONPayload | null) => void
}

function ExistingPacketUI(props: RedPacketDialogProps & ExistingPacketProps) {
    const classes = useStylesExtends(useExistingPacketStyles(), props)
    const { onSelect } = props

    // context
    const account = useAccount()

    //#region fetch red packets
    const blockNumber = useBlockNumber()
    const [availableRedPackets, setAvailableRedPackets] = useState<RedPacketRecord[]>([])
    useEffect(() => {
        const updateHandler = () => {
            Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketHistory', account)
                .then((records) =>
                    (records ?? []).map((record): unknown => ({
                        id: record._hash,
                        send_message: record._message,
                        block_creation_time: new Date(record.txTimestamp),
                        send_total: record._number,
                        sender_name: record._name,
                    })),
                )
                .then(setAvailableRedPackets as any)
        }
        updateHandler()
        return PluginMessageCenter.on('maskbook.red_packets.update', updateHandler)
    }, [blockNumber])
    //#endregion

    const onClick = useCallback(async (status?: RedPacketStatus | null, rpid?: RedPacketRecord['red_packet_id']) => {
        if (status === null) return onSelect?.(null)
        if (status === RedPacketStatus.pending || !rpid) return
        const redPacket = await Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketByID', undefined, rpid)
        if (typeof redPacket.raw_payload?.token === 'undefined') delete redPacket.raw_payload?.token
        onSelect?.(redPacket.raw_payload ?? null)
    }, [])
    return (
        <div className={classes.wrapper}>
            {availableRedPackets
                .sort((a, b) => {
                    if (!a.create_nonce) return -1
                    if (!b.create_nonce) return 1
                    return b.create_nonce - a.create_nonce
                })
                .map((p) => (
                    <RedPacketWithState onClick={onClick} key={p.id} redPacket={p} />
                ))}
        </div>
    )
}
//#endregion

//#region red packet dialog
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
    paper: {
        width: '500px !important',
    },
})

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const state = useState(0)
    const [, setTabState] = state
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_red_packet_create_new'),
                children: <NewPacketUI {...props} onCreate={() => setTabState(1)} />,
                p: 0,
            },
            {
                label: t('plugin_red_packet_select_existing'),
                children: (
                    <ExistingPacketUI
                        {...props}
                        onSelect={(payload: RedPacketJSONPayload | null) => {
                            const ref = getActivatedUI().typedMessageMetadata
                            const next = new Map(ref.value.entries())
                            payload ? next.set(RedPacketMetaKey, payload) : next.delete(RedPacketMetaKey)
                            ref.value = next
                            props.onConfirm(payload)
                        }}
                    />
                ),
                p: 0,
            },
        ],
        state,
    }

    return (
        <ShadowRootDialog
            className={classes.dialog}
            classes={{ container: classes.container, paper: classes.paper }}
            open={props.open}
            scroll="paper"
            fullWidth
            maxWidth="sm"
            disableAutoFocus
            disableEnforceFocus
            BackdropProps={{ className: classes.backdrop }}
            {...props.DialogProps}>
            <DialogTitle className={classes.header}>
                <IconButton classes={{ root: classes.close }} onClick={props.onDecline}>
                    <DialogDismissIconUI />
                </IconButton>
                <Typography className={classes.title} display="inline" variant="inherit">
                    {t('plugin_red_packet_display_name')}
                </Typography>
            </DialogTitle>
            <DialogContent className={classes.content}>
                <AbstractTab height={340} {...tabProps}></AbstractTab>
            </DialogContent>
        </ShadowRootDialog>
    )
}
//#endregion
