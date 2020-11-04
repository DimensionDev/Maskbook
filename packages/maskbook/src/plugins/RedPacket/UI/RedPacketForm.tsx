import React, { useState, useCallback, useMemo, ChangeEvent, useEffect } from 'react'
import {
    makeStyles,
    FormControl,
    TextField,
    createStyles,
    InputLabel,
    Select,
    MenuItem,
    MenuProps,
} from '@material-ui/core'
import { omit } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { formatBalance } from '../../Wallet/formatter'
import BigNumber from 'bignumber.js'
import {
    RED_PACKET_MIN_SHARES,
    RED_PACKET_MAX_SHARES,
    RED_PACKET_CONSTANTS,
    RED_PACKET_DEFAULT_SHARES,
} from '../constants'
import { useI18N } from '../../../utils/i18n-next-ui'
import { Token, EthereumTokenType, EthereumNetwork } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainState'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { createEetherToken } from '../../../web3/helpers'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useERC20TokenApproveCallback, ApproveState } from '../../../web3/hooks/useERC20TokenApproveCallback'
import { useCreateCallback } from '../hooks/useCreateCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import type { RedPacketJSONPayload } from '../types'
import { resolveChainName } from '../../../web3/pipes'
import { WalletMessageCenter } from '../../Wallet/messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'

const useStyles = makeStyles((theme) =>
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
        button: {
            margin: theme.spacing(2, 0),
            padding: 12,
        },
    }),
)

export interface RedPacketFormProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onCreate?(payload: RedPacketJSONPayload): void
    SelectMenuProps?: Partial<MenuProps>
}

export function RedPacketForm(props: RedPacketFormProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const HAPPY_RED_PACKET_ADDRESS = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS')
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
    const [amount, setAmount] = useState('0')
    const totalAmount = isRandom ? new BigNumber(amount) : new BigNumber(amount).multipliedBy(shares || '0')

    // balance
    const { value: tokenBalance = '0', error, loading: loadingTokenBalance } = useTokenBalance(token)
    //#endregion

    //#region approve ERC20
    const HappyRedPacketContractAddress = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS')
    const [approveState, approveCallback] = useERC20TokenApproveCallback(token, amount, HappyRedPacketContractAddress)
    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveState, approveCallback])
    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING
    //#endregion

    //#region blocking
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
    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        WalletMessageCenter,
        'transactionDialogUpdated',
        (ev) => {
            if (ev.open) return

            // reset state
            resetCreateCallback()

            // the settings is not available
            if (!createSettings) return

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
                payload.token = omit(createSettings.token, ['type', 'chainId'])

            // output the redpacket as JSON payload
            onCreate?.(payload)

            // always reset amount
            setAmount('0')
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (createState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: createState,
            summary: `Creating red packet with ${formatBalance(
                new BigNumber(totalAmount),
                token.decimals,
                token.decimals,
            )} ${token.symbol}`,
        })
    }, [createState /* update tx dialog only if state changed */])
    //#endregion

    const validationMessage = useMemo(() => {
        if (!account) return t('connect_a_wallet')
        if (!token.address) return 'Select a token'
        if (new BigNumber(shares || '0').isZero()) return 'Enter shares'
        if (new BigNumber(amount).isZero()) return 'Enter an amount'
        if (new BigNumber(totalAmount).isGreaterThan(new BigNumber(tokenBalance)))
            return `Insufficient ${token.symbol} balance`
        return ''
    }, [account, amount, totalAmount, shares, token, tokenBalance])

    return (
        <>
            <EthereumStatusBar classes={{ root: classes.bar }} />
            <div className={classes.line}>
                <FormControl className={classes.input} variant="outlined">
                    <InputLabel>{t('plugin_red_packet_split_mode')}</InputLabel>
                    <Select
                        value={isRandom ? 1 : 0}
                        onChange={(e) => setIsRandom(e.target.value as number)}
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
                    onChange={(e) => setMessage(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ placeholder: t('plugin_red_packet_best_wishes') }}
                    label={t('plugin_red_packet_attached_message')}
                    variant="outlined"
                    defaultValue={t('plugin_red_packet_best_wishes')}
                />
            </div>
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
                    fullWidth
                    variant="contained"
                    disabled={Boolean(validationMessage)}
                    onClick={createCallback}>
                    {validationMessage ||
                        `Send ${formatBalance(totalAmount, token.decimals, token.decimals)} ${token.symbol}`}
                </ActionButton>
            )}
            <SelectERC20TokenDialog
                open={openSelectERC20TokenDialog}
                excludeTokens={[token.address]}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
        </>
    )
}
