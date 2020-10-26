import React, { useState, useCallback, useMemo } from 'react'
import {
    makeStyles,
    FormControl,
    TextField,
    createStyles,
    InputLabel,
    Select,
    MenuItem,
    MenuProps,
    Divider,
    IconButton,
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { v4 as uuid } from 'uuid'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { formatBalance } from '../../Wallet/formatter'
import BigNumber from 'bignumber.js'
import {
    LOTTERY_CONSTANTS,
    DEFAULT_PRIZE_TOKEN_NUMBER,
    DEFAULT_DRAW_AT_TIME,
    DEFAULT_DRAW_AT_NUMBER,
    DEFAULT_DURATION,
    MAX_DRAW_NUMBER,
} from '../constants'
import { useI18N } from '../../../utils/i18n-next-ui'
import { Token, EthereumTokenType, EthereumNetwork } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainState'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { SetTokenPanel } from './componets/SetTokenPanel'
import { createEetherToken } from '../../../web3/helpers'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useTokenApproveCallback, ApproveState } from '../../../web3/hooks/useTokenApproveCallback'
import { useCreateCallback } from '../hooks/useCreateCallback'
import { TransactionDialog } from '../../../web3/UI/TransactionDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import type { LotteryJSONPayload } from '../types'
import { omit } from 'lodash-es'
import { resolveChainName } from '../../../web3/pipes'
import { createPrizeClass, getTotalToken, getTotalWinner } from '../utils'
import { TimePickerForm } from './componets/TimePickerForm'

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
        inputMinWidth: {
            flex: 1,
            padding: theme.spacing(1),
            minWidth: '30%',
        },
        tip: {
            fontSize: 12,
            color: theme.palette.text.secondary,
        },
        button: {
            margin: theme.spacing(2, 0),
            padding: 12,
        },
        optionsWrap: {
            position: 'relative',
            '& >div': {
                width: '40%',
                margin: theme.spacing(2),
            },
        },
        addButton: {
            position: 'absolute',
            bottom: '0',
            right: '10px',
        },
        nativeInput: {
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0,
            },
            '-moz-appearance': 'textfield',
        },
        prizeOptionWrap: {
            border: '1px solid #ccd6dd',
            borderRadius: '10px',
            margin: theme.spacing(1),
            padding: theme.spacing(1),
        },
    }),
)

export interface CreateLotteryProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onCreate?(payload: LotteryJSONPayload): void
    SelectMenuProps?: Partial<MenuProps>
}

export function CreateLotteryForm(props: CreateLotteryProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const LUCKY_LOTTERY_ADDRESS = useConstant(LOTTERY_CONSTANTS, 'LUCKY_LOTTERY_ADDRESS')
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

    //#region lotto settings
    const [if_draw_at_time, setDrawMode] = useState(0)
    const [message, setMessage] = useState(t('plugin_lottery_default_message'))
    const [draw_at_time, setDrawAtTime] = useState(DEFAULT_DRAW_AT_TIME)
    const [draw_at_number, setDrawAtNumber] = useState(DEFAULT_DRAW_AT_NUMBER)
    const [duration, setDuration] = useState(DEFAULT_DURATION)

    // sender name
    const senderName = useCurrentIdentity()?.linkedPersona?.nickname ?? 'Unknown User'

    // prize option
    interface opt {
        [key: number]: { token_number: string; winner_number: number }
    }
    const [optionsInput, setOptionsInput] = useState<opt>({
        0: {
            token_number: DEFAULT_PRIZE_TOKEN_NUMBER.toString(),
            winner_number: 0,
        },
    })
    const options: { token_number: string; winner_number: number }[] = Object.keys(optionsInput).map(function (
        s: string,
        e: number,
    ) {
        const winner_number = optionsInput[e].winner_number
        const token_number = new BigNumber(optionsInput[e].token_number)
            .multipliedBy(new BigNumber(10).pow(token.decimals))
            .toFixed()
        return { token_number: token_number, winner_number: winner_number }
    })
    const handleOptionsTokenInput = (index: number, e: any) => {
        var _token_number: string = ''
        var val = parseFloat((e.target as HTMLInputElement)?.value)
        _token_number = new BigNumber(val).toFixed()
        const new_op = { token_number: _token_number, winner_number: optionsInput[index].winner_number }
        setOptionsInput({
            ...optionsInput,
            [index]: new_op,
        })
    }
    const handleOptionsWinnerInput = (index: number, e: any) => {
        const new_op = {
            token_number: optionsInput[index].token_number,
            winner_number: parseInt((e.target as HTMLInputElement)?.value),
        }
        setOptionsInput({
            ...optionsInput,
            [index]: new_op,
        })
    }
    const addNewOption = () => {
        const length = options.length
        setOptionsInput({
            ...optionsInput,
            [length]: {
                token_number: DEFAULT_PRIZE_TOKEN_NUMBER.toString(),
                winner_number: 0,
            },
        })
    }

    //prize class
    var prize_class = createPrizeClass(options)
    var total_token = new BigNumber(getTotalToken(prize_class ?? []))
    var total_winner = getTotalWinner(prize_class ?? [])

    // balance
    const { value: tokenBalance = '0', error, loading: loadingTokenBalance } = useTokenBalance(token)
    if (error) {
        console.log('DEBUG: token balance error')
        console.log(error)
    }
    //#endregion

    //#region approve ERC20
    const LuckyLotteryContractAddress = useConstant(LOTTERY_CONSTANTS, 'LUCKY_LOTTERY_ADDRESS')
    const [approveState, approveCallback] = useTokenApproveCallback(
        token,
        total_token.toString(),
        LuckyLotteryContractAddress,
    )
    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveState, approveCallback])
    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING
    //#endregion

    //#region blocking
    const [createSettings, createState, createCallback] = useCreateCallback({
        password: uuid(),
        duration: duration,
        if_draw_at_time: Boolean(if_draw_at_time),
        draw_at_time: draw_at_time,
        draw_at_number: draw_at_number,
        prize_class: prize_class || [],
        token,
        name: senderName,
        message,
        total: total_token.toFixed(),
    })
    const [openTransactionDialog, setOpenTransactionDialog] = useState(false)
    const onSubmit = useCallback(async () => {
        setOpenTransactionDialog(true)
        await createCallback()
    }, [createCallback])
    const onTransactionDialogClose = useCallback(async () => {
        setOpenTransactionDialog(false)

        // the settings is not available
        if (!createSettings) return

        // TODO:
        // earily return happended
        // we should guide user to select the red packet in the existing list
        if (createState.type !== TransactionStateType.CONFIRMED) return

        const { receipt } = createState
        const CreationSuccess = (receipt.events?.CreationSuccess.returnValues ?? {}) as {
            total_token: string
            id: string
            creator: string
            creation_time: string
            token_address: string
        }
        // assemble JSON payload
        const payload: LotteryJSONPayload = {
            contract_version: 1,
            contract_address: LUCKY_LOTTERY_ADDRESS,
            lyid: CreationSuccess.id,
            password: createSettings.password,
            prize_class: createSettings.prize_class,
            sender: {
                address: account,
                name: createSettings.name,
                message: createSettings.message,
            },
            if_draw_at_time: createSettings.if_draw_at_time,
            draw_at_time: createSettings.draw_at_time,
            draw_at_number: createSettings.draw_at_number,
            total_token: CreationSuccess.total_token,
            total_winner: getTotalWinner(createSettings.prize_class),
            creation_time: Number.parseInt(CreationSuccess.creation_time),
            duration: createSettings.duration,
            network: resolveChainName(chainId) as EthereumNetwork,
            token_type: createSettings.token.type,
        }
        if (createSettings.token.type === EthereumTokenType.ERC20)
            payload.token = omit(createSettings.token, ['type', 'chainId'])

        // output the Lottery as JSON payload
        onCreate?.(payload)
    }, [account, chainId, createSettings, createState, onCreate, LUCKY_LOTTERY_ADDRESS])
    //#endregion

    const validationMessage = useMemo(() => {
        const total = total_token.dividedBy(new BigNumber(10).pow(token.decimals)).toFixed()
        if (!account) return 'Connect a Wallet'
        if (!token.address) return 'Select a token'
        if (new BigNumber(total_winner || '0').isZero()) return 'Enter winner'
        if (new BigNumber(total_token).isZero()) return 'Enter an amount'
        if (new BigNumber(total).isGreaterThan(new BigNumber(tokenBalance)))
            return `Insufficient ${token.symbol} balance`
        return ''
    }, [account, optionsInput, total_token, total_winner, token, tokenBalance])

    return (
        <>
            <EthereumStatusBar classes={{ root: classes.bar }} />
            <div className={classes.line}>
                <FormControl className={classes.input} variant="outlined">
                    <TextField
                        label={t('plugin_lottery_description_message')}
                        variant="outlined"
                        onChange={(e) => {
                            setMessage((e.target as HTMLInputElement)?.value)
                        }}
                        defaultValue={message}
                    />
                </FormControl>
            </div>

            <div className={classes.line}>
                <FormControl className={classes.inputMinWidth} variant="outlined">
                    <InputLabel>{t('plugin_lottery_draw_mode')}</InputLabel>
                    <Select
                        value={if_draw_at_time ? 1 : 0}
                        onChange={(e) => setDrawMode(e.target.value as number)}
                        MenuProps={props.SelectMenuProps}>
                        <MenuItem value={1}>{t('plugin_lottery_draw_at_time')}</MenuItem>
                        <MenuItem value={0}>{t('plugin_lottery_draw_at_number')}</MenuItem>
                    </Select>
                </FormControl>
                {!!if_draw_at_time && (
                    <TimePickerForm label={t('plugin_lottery_decription_draw_time')} callback={setDrawAtTime} />
                )}
                {!if_draw_at_time && (
                    <TextField
                        className={classes.input}
                        inputProps={{
                            min: 0,
                            max: MAX_DRAW_NUMBER,
                            className: classes.nativeInput,
                        }}
                        onChange={(e) => {
                            setDrawAtNumber(parseInt((e.target as HTMLInputElement)?.value))
                        }}
                        label={t('plugin_lottery_decription_draw_number')}
                        variant="outlined"
                        type="number"
                        defaultValue={DEFAULT_DRAW_AT_NUMBER}
                    />
                )}
            </div>
            <div className={classes.line}>
                {!if_draw_at_time && (
                    <TimePickerForm label={t('plugin_lottery_decription_duration_time')} callback={setDuration} />
                )}
            </div>
            <div className={classes.prizeOptionWrap}>
                <FormControl className={classes.line}>
                    <SetTokenPanel
                        balance={tokenBalance}
                        token={token}
                        SelectTokenChip={{
                            loading: loadingTokenBalance,
                            ChipProps: {
                                onClick: onTokenChipClick,
                            },
                        }}
                    />
                </FormControl>
                <Divider light />
                <div className={classes.optionsWrap}>
                    {options.map((option, index) => (
                        <FormControl className={classes.input} key={index}>
                            <TextField
                                label={t('plugin_lottery_prize_option_token_number', { index: index + 1 })}
                                type="number"
                                variant="outlined"
                                onChange={(e) => {
                                    handleOptionsTokenInput(index, e)
                                }}
                                defaultValue={0.01}
                                inputProps={{
                                    min: 0.0,
                                    className: classes.nativeInput,
                                }}
                            />
                            <br />
                            <TextField
                                label={t('plugin_lottery_prize_option_winner_number', { index: index + 1 })}
                                type="number"
                                variant="outlined"
                                onChange={(e) => {
                                    handleOptionsWinnerInput(index, e)
                                }}
                                defaultValue={0}
                                inputProps={{
                                    min: 0,
                                    max: MAX_DRAW_NUMBER,
                                    className: classes.nativeInput,
                                }}
                            />
                        </FormControl>
                    ))}
                    <IconButton onClick={addNewOption} classes={{ root: classes.addButton }}>
                        <AddIcon color="primary" />
                    </IconButton>
                </div>
            </div>
            <div className={classes.line}>
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
                        onClick={onSubmit}>
                        {validationMessage ||
                            `Send ${formatBalance(total_token, token.decimals, token.decimals)} ${token.symbol}`}
                    </ActionButton>
                )}
                <SelectERC20TokenDialog
                    open={openSelectERC20TokenDialog}
                    excludeTokens={[token.address]}
                    onSubmit={onSelectERC20TokenDialogSubmit}
                    onClose={onSelectERC20TokenDialogClose}
                />
            </div>
            <TransactionDialog
                state={createState}
                summary={`Creating lottery with ${formatBalance(
                    new BigNumber(total_token),
                    token.decimals,
                    token.decimals,
                )} ${token.symbol}`}
                open={openTransactionDialog}
                onClose={onTransactionDialogClose}
            />
        </>
    )
}
