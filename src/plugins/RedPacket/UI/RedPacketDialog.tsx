import React, { useState, useEffect } from 'react'
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
    CircularProgress,
} from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../../components/InjectedComponents/DialogDismissIcon'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import { RedPacketWithState } from './RedPacket'
import Services from '../../../extension/service'
import type { CreateRedPacketInit } from '../state-machine'
import { EthereumTokenType } from '../../Wallet/database/types'
import type { RedPacketRecord, RedPacketJSONPayload } from '../types'
import { RedPacketStatus } from '../types'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { useCapturedInput } from '../../../utils/hooks/useCapturedEvents'
import { PluginMessageCenter } from '../../PluginMessages'
import { getActivatedUI } from '../../../social-network/ui'
import { formatBalance } from '../../Wallet/formatter'
import ShadowRootDialog from '../../../utils/jss/ShadowRootDialog'
import { PortalShadowRoot } from '../../../utils/jss/ShadowRootPortal'
import BigNumber from 'bignumber.js'
import { useSelectWallet, useTokens, useWallets } from '../../shared/useWallet'
import { WalletSelect } from '../../shared/WalletSelect'
import { TokenSelect } from '../../shared/TokenSelect'
import { FeedbackDialog } from './FeedbackDialog'
import type { WalletDetails, ERC20TokenDetails } from '../../../extension/background-script/PluginService'
import { RedPacketMetaKey } from '../constants'
import { useI18N } from '../../../utils/i18n-next-ui'

//#region new red packet
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
    senderName?: string
    loading: boolean
    wallets: WalletDetails[] | undefined
    tokens: ERC20TokenDetails[] | undefined
    onCreateNewPacket: (opt: CreateRedPacketInit) => void
}

function NewPacketUI(props: RedPacketDialogProps & NewPacketProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useNewPacketStyles(), props)
    const { loading, wallets, tokens } = props
    const [is_random, setIsRandom] = useState(0)

    const [send_message, setMsg] = useState('Best Wishes!')
    const [, msgRef] = useCapturedInput(setMsg)

    const [send_per_share, setSendPerShare] = useState(0.01)
    const [, perShareRef] = useCapturedInput((x) => setSendPerShare(parseFloat(x)))

    const [shares, setShares] = useState(5)
    const [, sharesRef] = useCapturedInput((x) => setShares(parseInt(x)))

    const useSelectWalletResult = useSelectWallet(wallets, tokens)
    const {
        erc20Balance,
        ethBalance,
        selectedToken,
        selectedTokenType,
        selectedTokenAddress,
        selectedWallet,
        selectedWalletAddress,
    } = useSelectWalletResult

    const amountPreShareMaxBigint = selectedWallet
        ? selectedTokenType === EthereumTokenType.ETH
            ? selectedWallet.eth_balance
            : selectedToken?.amount
        : undefined
    const amountPreShareMaxNumber = BigNumber.isBigNumber(amountPreShareMaxBigint)
        ? selectedTokenType === EthereumTokenType.ETH
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

    const onCreate = async () => {
        const power = selectedTokenType === EthereumTokenType.ETH ? 18 : selectedToken!.decimals
        props.onCreateNewPacket({
            duration: 60 /* seconds */ * 60 /* mins */ * 24 /* hours */,
            is_random: Boolean(is_random),
            network: await Services.Plugin.getCurrentEthChain(),
            send_message,
            send_total: new BigNumber(send_total).multipliedBy(new BigNumber(10).pow(power)),
            sender_address: selectedWalletAddress!,
            sender_name: props.senderName ?? 'Unknown User',
            shares: new BigNumber(shares),
            token_type: selectedTokenType === EthereumTokenType.ETH ? EthereumTokenType.ETH : EthereumTokenType.ERC20,
            erc20_token: selectedTokenType === EthereumTokenType.ETH ? undefined : selectedTokenAddress,
        })
    }
    return (
        <div>
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
                    <InputLabel>{t('plugin_red_packet_split_mode')}</InputLabel>
                    <Select
                        MenuProps={{ container: props.DialogProps?.container ?? PortalShadowRoot }}
                        value={is_random ? 1 : 0}
                        onChange={(e) => setIsRandom(e.target.value as number)}>
                        <MenuItem value={0}>{t('plugin_red_packet_average')}</MenuItem>
                        <MenuItem value={1}>{t('plugin_red_packet_random')}</MenuItem>
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
                    label={is_random ? t('plugin_red_packet_total_amount') : t('plugin_red_packet_amount_per_share')}
                    variant="filled"
                    type="number"
                    defaultValue={send_per_share}
                />
                <TextField
                    className={classes.input}
                    InputProps={{ inputRef: sharesRef }}
                    inputProps={{ min: 1 }}
                    label={t('plugin_red_packet_shares')}
                    variant="filled"
                    type="number"
                    defaultValue={shares}
                />
            </div>
            <div className={classes.line}>
                <TextField
                    className={classes.input}
                    InputProps={{ inputRef: msgRef }}
                    label={t('plugin_red_packet_attached_message')}
                    variant="filled"
                    defaultValue={t('plugin_red_packet_best_wishes')}
                />
            </div>
            <div className={classes.line}>
                <Typography variant="body2">
                    {selectedWallet
                        ? t(erc20Balance ? 'wallet_balance_with_erc20' : 'wallet_balance', {
                              erc20Balance,
                              ethBalance,
                          })
                        : null}
                    <br />
                    {t('wallet_balance_notice')}
                </Typography>
                <Button
                    className={classes.button}
                    style={{ marginLeft: 'auto', minWidth: 140, whiteSpace: 'nowrap' }}
                    color="primary"
                    variant="contained"
                    startIcon={props.loading ? <CircularProgress size={24} /> : null}
                    disabled={loading || isSendButtonDisabled}
                    onClick={onCreate}>
                    {isSendButtonDisabled
                        ? t('plugin_red_packet_not_valid')
                        : t('plugin_red_packet_send', {
                              symbol: +send_total.toFixed(3) === +send_total.toFixed(9) ? '' : '~',
                              amount: +send_total.toFixed(3),
                              type: selectedTokenType === EthereumTokenType.ETH ? 'ETH' : selectedToken?.symbol,
                          })}
                </Button>
            </div>
        </div>
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
    onSelectExistingPacket(opt?: RedPacketJSONPayload | null): void
    redPackets: RedPacketRecord[]
}

function ExistingPacketUI(props: RedPacketDialogProps & ExistingPacketProps) {
    const { onSelectExistingPacket, redPackets } = props
    const classes = useStylesExtends(useExistingPacketStyles(), props)

    const insertRedPacket = (status?: RedPacketStatus | null, rpid?: RedPacketRecord['red_packet_id']) => {
        if (status === null) return onSelectExistingPacket(null)
        if (status === RedPacketStatus.pending || !rpid) return
        Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketByID', undefined, rpid).then((p) =>
            onSelectExistingPacket(p.raw_payload),
        )
    }
    return (
        <div className={classes.wrapper}>
            {redPackets
                .sort((a, b) => {
                    if (!a.create_nonce) return -1
                    if (!b.create_nonce) return 1
                    return b.create_nonce - a.create_nonce
                })
                .map((p) => (
                    <RedPacketWithState onClick={insertRedPacket} key={p.id} redPacket={p} />
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
})

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const { t } = useI18N()
    const { data: wallets } = useWallets()
    const { data: tokens } = useTokens()
    const [availableRedPackets, setAvailableRedPackets] = useState<RedPacketRecord[]>([])
    const [justCreatedRedPacket, setJustCreatedRedPacket] = useState<RedPacketRecord | undefined>(undefined)

    const [status, setStatus] = useState<'succeed' | 'failed' | 'undetermined' | 'initial'>('initial')
    const loading = status === 'undetermined'
    const [createError, setCreateError] = useState<Error | null>(null)
    const onCreate = async (opt: CreateRedPacketInit) => {
        try {
            setStatus('undetermined')
            const { id } = await Services.Plugin.invokePlugin('maskbook.red_packet', 'createRedPacket', opt)
            const redPackets = await Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPackets')
            const redPacket = redPackets.find((x) => x.id === id)
            setJustCreatedRedPacket(redPacket)
            setStatus('succeed')
            setTabState(1)
        } catch (e) {
            setCreateError(e)
            setStatus('failed')
        }
    }
    const onSelect = (payload?: RedPacketJSONPayload | null) => {
        const ref = getActivatedUI().typedMessageMetadata
        const next = new Map(ref.value.entries())
        payload ? next.set(RedPacketMetaKey, payload) : next.delete(RedPacketMetaKey)
        ref.value = next
        props.onConfirm(payload)
    }
    useEffect(() => {
        const updateHandler = () => {
            Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPackets')
                .then((packets) =>
                    packets.filter(
                        (p) =>
                            p.create_transaction_hash &&
                            (p.status === RedPacketStatus.normal ||
                                p.status === RedPacketStatus.incoming ||
                                p.status === RedPacketStatus.claimed ||
                                p.status === RedPacketStatus.pending ||
                                p.status === RedPacketStatus.claim_pending),
                    ),
                )
                .then(setAvailableRedPackets)
        }
        updateHandler()
        return PluginMessageCenter.on('maskbook.red_packets.update', updateHandler)
    }, [justCreatedRedPacket])

    const classes = useStylesExtends(useStyles(), props)
    const state = useState(0)
    const [, setTabState] = state
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_red_packet_create_new'),
                children: (
                    <NewPacketUI
                        {...props}
                        loading={loading}
                        senderName={useCurrentIdentity()?.linkedPersona?.nickname}
                        wallets={wallets}
                        tokens={tokens}
                        onCreateNewPacket={onCreate}
                    />
                ),
                p: 0,
            },
            {
                label: t('plugin_red_packet_select_existing'),
                children: (
                    <ExistingPacketUI {...props} redPackets={availableRedPackets} onSelectExistingPacket={onSelect} />
                ),
                p: 0,
            },
        ],
        state,
    }

    return (
        <>
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
                    <AbstractTab height={400} {...tabProps}></AbstractTab>
                </DialogContent>
            </ShadowRootDialog>
            <FeedbackDialog
                title={t('plugin_red_packet_create_failed')}
                message={createError?.message}
                open={status === 'failed'}
                onClose={() => setStatus('initial')}
            />
        </>
    )
}
//#endregion
