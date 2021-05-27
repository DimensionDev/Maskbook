import { useState, useCallback, useMemo, ChangeEvent, useEffect } from 'react'
import { makeStyles, FormControl, TextField, InputLabel, Select, MenuItem, MenuProps } from '@material-ui/core'
import { omit } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import BigNumber from 'bignumber.js'

import { formatBalance } from '@dimensiondev/maskbook-shared'
import { useI18N, useRemoteControlledDialog } from '../../../utils'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import {
    RED_PACKET_MIN_SHARES,
    RED_PACKET_MAX_SHARES,
    RED_PACKET_CONSTANTS,
    RED_PACKET_DEFAULT_SHARES,
} from '../constants'
import { EthereumTokenType, EthereumNetwork, FungibleTokenDetailed } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainId'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useCreateCallback } from '../hooks/useCreateCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import type { RedPacketJSONPayload } from '../types'
import { resolveChainName } from '../../../web3/pipes'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { useNativeTokenDetailed } from '../../../web3/hooks/useNativeTokenDetailed'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { EthereumMessages } from '../../Ethereum/messages'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'

const useStyles = makeStyles((theme) => ({
    line: {
        display: 'flex',
        margin: theme.spacing(1),
    },
    input: {
        flex: 1,
        padding: theme.spacing(0.5),
    },
    tip: {
        fontSize: 12,
        color: theme.palette.text.secondary,
    },
    button: {
        marginTop: theme.spacing(1.5),
    },
    selectShrinkLabel: {
        transform: 'translate(17px, -10px) scale(0.75) !important',
    },
    inputShrinkLabel: {
        transform: 'translate(17px, -3px) scale(0.75) !important',
    },
}))

export interface RedPacketFormProps extends withClasses<never> {
    onCreate?(payload: RedPacketJSONPayload): void
    SelectMenuProps?: Partial<MenuProps>
}

export function RedPacketForm(props: RedPacketFormProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const HAPPY_RED_PACKET_ADDRESS = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS')

    // context
    const account = useAccount()
    const chainId = useChainId()
    const RED_PACKET_ADDRESS = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS')

    //#region select token
    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
    const [token = nativeTokenDetailed, setToken] = useState<FungibleTokenDetailed | undefined>()
    const [id] = useState(uuid())
    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                setToken(ev.token)
            },
            [id],
        ),
    )
    const onSelectTokenChipClick = useCallback(() => {
        setSelectTokenDialog({
            open: true,
            uuid: id,
            disableNativeToken: false,
            FixedTokenListProps: {
                selectedTokens: token ? [token.address] : [],
            },
        })
    }, [id, token?.address])
    //#endregion

    //#region packet settings
    const [isRandom, setIsRandom] = useState(0)
    const [message, setMessage] = useState('Best Wishes!')
    const senderName = useCurrentIdentity()?.linkedPersona?.nickname ?? 'Unknown User'

    // shares
    const [shares, setShares] = useState<number | ''>(RED_PACKET_DEFAULT_SHARES)
    const onShareChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const shares_ = ev.currentTarget.value.replace(/[,\.]/g, '')
            if (shares_ === '') setShares('')
            else if (/^[1-9]+\d*$/.test(shares_)) {
                const parsed = Number.parseInt(shares_, 10)
                if (parsed >= RED_PACKET_MIN_SHARES && parsed <= RED_PACKET_MAX_SHARES)
                    setShares(Number.parseInt(shares_, 10))
            }
        },
        [RED_PACKET_MIN_SHARES, RED_PACKET_MAX_SHARES],
    )

    // amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = new BigNumber(rawAmount || '0').multipliedBy(new BigNumber(10).pow(token?.decimals ?? 0))
    const totalAmount = isRandom ? new BigNumber(amount) : new BigNumber(amount).multipliedBy(shares || '0')

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Native,
        token?.address ?? '',
    )
    //#endregion

    // send transaction and wait for hash
    const [createSettings, createState, createCallback, resetCreateCallback] = useCreateCallback({
        password: uuid(),
        duration: 60 /* seconds */ * 60 /* mins */ * 24 /* hours */,
        isRandom: Boolean(isRandom),
        name: senderName,
        message,
        shares: shares || 0,
        token,
        total: totalAmount.toFixed(),
    })
    //#endregion

    //#region remote controlled transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return

            // reset state
            resetCreateCallback()

            // the settings is not available
            if (!createSettings?.token) return

            // TODO:
            // earily return happended
            // we should guide user to select the red packet in the existing list
            if (createState.type !== TransactionStateType.CONFIRMED) return

            const { receipt } = createState
            const CreationSuccess = (receipt.events?.CreationSuccess.returnValues ?? {}) as {
                creation_time: string
                creator: string
                id: string
                token_address: string
                total: string
            }

            // assemble JSON payload
            const payload: RedPacketJSONPayload = {
                contract_version: 1,
                contract_address: HAPPY_RED_PACKET_ADDRESS,
                rpid: CreationSuccess.id,
                password: createSettings.password,
                shares: createSettings.shares,
                sender: {
                    address: account,
                    name: createSettings.name,
                    message: createSettings.message,
                },
                is_random: createSettings.isRandom,
                total: CreationSuccess.total,
                creation_time: Number.parseInt(CreationSuccess.creation_time, 10) * 1000,
                duration: createSettings.duration,
                network: resolveChainName(chainId) as EthereumNetwork,
                token_type: createSettings.token.type,
            }
            if (createSettings.token.type === EthereumTokenType.ERC20)
                payload.token = {
                    name: '',
                    symbol: '',
                    ...omit(createSettings.token, ['type', 'chainId']),
                }

            // output the redpacket as JSON payload
            props.onCreate?.(payload)

            // always reset amount
            setRawAmount('0')
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token || createState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            state: createState,
            summary: t('plugin_red_packet_create_with_token', {
                symbol: `${formatBalance(totalAmount, token.decimals)} ${token.symbol}`,
            }),
        })
    }, [createState /* update tx dialog only if state changed */])
    //#endregion

    const validationMessage = useMemo(() => {
        if (!token) return t('plugin_wallet_select_a_token')
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (new BigNumber(shares || '0').isZero()) return 'Enter shares'
        if (new BigNumber(shares || '0').isGreaterThan(255)) return 'At most 255 recipients'
        if (new BigNumber(amount).isZero()) return t('plugin_dhedge_enter_an_amount')
        if (new BigNumber(totalAmount).isGreaterThan(tokenBalance))
            return t('plugin_gitcoin_insufficient_balance', { symbol: token.symbol })
        return ''
    }, [account, amount, totalAmount, shares, token, tokenBalance])

    if (!token) return null
    return (
        <>
            <div className={classes.line}>
                <FormControl className={classes.input} variant="outlined">
                    <InputLabel className={classes.selectShrinkLabel}>{t('plugin_red_packet_split_mode')}</InputLabel>
                    <Select
                        variant="standard"
                        value={isRandom ? 1 : 0}
                        onChange={(e) => {
                            // foolproof, reset amount since the meaning of amount changed:
                            //  'total amount' <=> 'amount per share'
                            setRawAmount('0')
                            setIsRandom(e.target.value as number)
                        }}
                        MenuProps={props.SelectMenuProps}>
                        <MenuItem value={0}>{t('plugin_red_packet_average')}</MenuItem>
                        <MenuItem value={1}>{t('plugin_red_packet_random')}</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    className={classes.input}
                    InputProps={{
                        inputProps: {
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            placeholder: '0',
                            pattern: '^[0-9]$',
                            spellCheck: false,
                        },
                    }}
                    InputLabelProps={{
                        shrink: true,
                        classes: {
                            shrink: classes.inputShrinkLabel,
                        },
                    }}
                    label={t('plugin_red_packet_shares')}
                    value={shares}
                    onChange={onShareChange}
                />
            </div>
            <div className={classes.line}>
                <TokenAmountPanel
                    classes={{ root: classes.input }}
                    label={isRandom ? 'Total Amount' : t('plugin_red_packet_amount_per_share')}
                    amount={rawAmount}
                    balance={tokenBalance}
                    token={token}
                    onAmountChange={setRawAmount}
                    SelectTokenChip={{
                        loading: loadingTokenBalance,
                        ChipProps: {
                            onClick: onSelectTokenChipClick,
                        },
                    }}
                />
            </div>
            <div className={classes.line}>
                <TextField
                    className={classes.input}
                    onChange={(e) => setMessage(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                        classes: {
                            shrink: classes.inputShrinkLabel,
                        },
                    }}
                    inputProps={{ placeholder: t('plugin_red_packet_best_wishes') }}
                    label={t('plugin_red_packet_attached_message')}
                    defaultValue={t('plugin_red_packet_best_wishes')}
                />
            </div>
            <EthereumWalletConnectedBoundary>
                <EthereumERC20TokenApprovedBoundary
                    amount={totalAmount.toFixed()}
                    token={token?.type === EthereumTokenType.ERC20 ? token : undefined}
                    spender={RED_PACKET_ADDRESS}>
                    <ActionButton
                        variant="contained"
                        size="large"
                        className={classes.button}
                        fullWidth
                        disabled={!!validationMessage}
                        onClick={createCallback}>
                        {validationMessage ||
                            t('plugin_red_packet_send_symbol', {
                                symbol: `${formatBalance(totalAmount, token.decimals)} ${token.symbol}`,
                            })}
                    </ActionButton>
                </EthereumERC20TokenApprovedBoundary>
            </EthereumWalletConnectedBoundary>
        </>
    )
}
