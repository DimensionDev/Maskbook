import { createStyles, makeStyles, Box, TextField, Grid } from '@material-ui/core'
import React, { useState, useCallback, useMemo, useEffect, ChangeEvent } from 'react'
import BigNumber from 'bignumber.js'
import { v4 as uuid } from 'uuid'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumTokenType } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { ApproveState, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'
import { ExchangeTokenPanelGroup } from './ExchangeTokenPanel'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import type { PoolSettings } from '../hooks/useFillCallback'
import type { ExchangeTokenAndAmountState } from '../hooks/useExchangeTokenAmountstate'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useChainIdValid } from '../../../web3/hooks/useChainState'
import { formatAmount, formatBalance } from '../../Wallet/formatter'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            margin: theme.spacing(1),
            display: 'flex',
        },
        flow: {
            margin: theme.spacing(1),
            textAlign: 'center',
        },
        bar: {
            padding: theme.spacing(0, 2, 2),
        },
        input: {
            padding: theme.spacing(1),
            flex: 1,
        },
        label: {
            paddingLeft: theme.spacing(2),
        },
        tip: {
            fontSize: 12,
            color: theme.palette.text.secondary,
        },
        button: {
            margin: theme.spacing(2, 0),
            padding: 12,
        },
        date: {
            flex: 1,
            padding: theme.spacing(1),
        },
    }),
)

export interface CreateFormProps extends withClasses<never> {
    onChangePoolSettings: (pollSettings: PoolSettings) => void
    onConnectWallet: () => void
    onNext: () => void
}

export function CreateForm(props: CreateFormProps) {
    const { onChangePoolSettings, onNext, onConnectWallet } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainIdValid = useChainIdValid()

    const senderName = useCurrentIdentity()?.linkedPersona?.nickname ?? 'Unknown User'
    const [message, setMessage] = useState('')
    const [totalOfPerWallet, setTotalOfPerWallet] = useState('')
    const [tokenAndAmount, setTokenAndAmount] = useState<ExchangeTokenAndAmountState>()
    const [tokenAndAmounts, setTokenAndAmounts] = useState<ExchangeTokenAndAmountState[]>([])
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')

    const GMT = new Date().getTimezoneOffset() / 60

    // amount for displaying
    const inputTokenAmount = formatAmount(
        new BigNumber(tokenAndAmount?.amount ?? '0'),
        tokenAndAmount?.token?.decimals ?? 0,
    )

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        tokenAndAmount?.token?.type ?? EthereumTokenType.Ether,
        tokenAndAmount?.token?.address ?? '',
    )

    //#region approve
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const [approveState, approveCallback] = useERC20TokenApproveCallback(
        tokenAndAmount?.token?.type === EthereumTokenType.ERC20 ? tokenAndAmount?.token?.address : '',
        inputTokenAmount,
        ITO_CONTRACT_ADDRESS,
    )

    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveState, approveCallback])
    const onExactApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback(true)
    }, [approveState, approveCallback])
    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING
    //#endregion

    const onTotalOfPerWalletChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const total = ev.currentTarget.value
        if (total === '') setTotalOfPerWallet('')
        if (/^\d+[\.]?\d*$/.test(total)) {
            setTotalOfPerWallet(total)
        } else {
            setTotalOfPerWallet('')
        }
    }, [])

    useEffect(() => {
        const [first, ...rest] = tokenAndAmounts
        setTokenAndAmount(first)
        onChangePoolSettings({
            password: uuid(),
            name: senderName,
            title: message,
            limit: formatAmount(new BigNumber(totalOfPerWallet || '0'), first?.token?.decimals ?? 0),
            token: first?.token,
            total: formatAmount(new BigNumber(first?.amount || '0'), first?.token?.decimals ?? 0),
            exchangeAmounts: rest.map((item) =>
                formatAmount(new BigNumber(item.amount || '0'), first?.token?.decimals ?? 0),
            ),
            exchangeVolumes: new Array(rest.length).fill('0'),
            exchangeTokens: rest.map((item) => item.token!),
            startTime: new Date(startTime),
            endTime: new Date(endTime),
        })
    }, [
        senderName,
        message,
        totalOfPerWallet,
        tokenAndAmount,
        tokenAndAmounts,
        setTokenAndAmount,
        startTime,
        endTime,
        account,
        onChangePoolSettings,
    ])

    const validationMessage = useMemo(() => {
        if (!tokenAndAmounts || tokenAndAmounts.length === 0) return t('plugin_ito_error_enter_amount_and_token')
        for (const { amount, token } of tokenAndAmounts) {
            if (!token) return t('plugin_ito_error_select_token')
            if (new BigNumber(amount).isZero()) return t('plugin_ito_error_enter_amount')
        }

        if (new BigNumber(tokenAndAmount?.amount ?? '0').isGreaterThan(new BigNumber(tokenBalance)))
            return t('plugin_ito_error_balance', {
                symbol: tokenAndAmount?.token?.symbol,
            })

        if (
            new BigNumber(totalOfPerWallet).isZero() ||
            new BigNumber(totalOfPerWallet).isGreaterThan(new BigNumber(tokenAndAmount?.amount ?? '0'))
        )
            return t('plugin_ito_error_enter_allocation_per_walllet')

        if (startTime === '' || endTime === '' || startTime >= endTime) return t('plugin_ito_error_exchange_time')

        return ''
    }, [
        endTime,
        startTime,
        t,
        tokenAndAmount?.amount,
        tokenAndAmount?.token?.symbol,
        tokenAndAmounts,
        tokenBalance,
        totalOfPerWallet,
    ])

    const handleStartTime = useCallback(
        (timeString: string) => {
            const time = new Date(timeString).getTime()
            if (endTime === '' || time < new Date(endTime).getTime()) setStartTime(timeString)
        },
        [endTime],
    )

    const handleEndTime = useCallback(
        (timeString: string) => {
            const time = new Date(timeString).getTime()
            const now = new Date()
            if (time < now.getTime()) return
            if (startTime === '' || time > new Date(startTime).getTime()) setEndTime(timeString)
        },
        [startTime],
    )

    return (
        <>
            <EthereumStatusBar classes={{ root: classes.bar }} />
            <Box className={classes.line} style={{ display: 'block' }}>
                <ExchangeTokenPanelGroup
                    originToken={tokenAndAmount?.token}
                    onTokenAmountChange={(arr) => setTokenAndAmounts(arr)}
                />
            </Box>
            <Box className={classes.line}>
                <TextField
                    className={classes.input}
                    label={t('plugin_item_message_label')}
                    defaultValue=""
                    onChange={(e) => setMessage(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Box>
            <Box className={classes.line}>
                <TextField
                    className={classes.input}
                    label={t('plugin_ito_allocation_per_wallet')}
                    onChange={onTotalOfPerWalletChange}
                    value={totalOfPerWallet}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    InputProps={{
                        endAdornment: tokenAndAmount?.token?.symbol,
                        inputProps: {
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            placeholder: '0.0',
                            pattern: '^[0-9]$',
                            spellCheck: false,
                        },
                    }}
                />
            </Box>
            <Box className={classes.line} style={{ display: 'flex' }}>
                <TextField
                    className={classes.date}
                    onChange={(ev) => handleStartTime(ev.target.value)}
                    label={t('plugin_ito_begin_times_label', { GMT })}
                    type="datetime-local"
                    value={startTime}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    required={true}
                />

                <TextField
                    required={true}
                    className={classes.date}
                    onChange={(ev) => handleEndTime(ev.target.value)}
                    label={t('plugin_ito_end_times_label', { GMT })}
                    type="datetime-local"
                    value={endTime}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Box>
            <Box className={classes.line}>
                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                    {approveRequired ? (
                        approveState === ApproveState.PENDING ? (
                            <Grid item xs={12}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={approveState === ApproveState.PENDING}>
                                    {`Unlocking ${tokenAndAmount?.token?.symbol ?? 'Token'}…`}
                                </ActionButton>
                            </Grid>
                        ) : (
                            <>
                                <Grid item xs={6}>
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={onExactApprove}>
                                        {approveState === ApproveState.NOT_APPROVED
                                            ? t('plugin_wallet_token_unlock', {
                                                  balance: formatBalance(
                                                      new BigNumber(inputTokenAmount),
                                                      tokenAndAmount?.token?.decimals ?? 0,
                                                      2,
                                                  ),
                                                  symbol: tokenAndAmount?.token?.symbol ?? 'Token',
                                              })
                                            : ''}
                                    </ActionButton>
                                </Grid>
                                <Grid item xs={6}>
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={onApprove}>
                                        {approveState === ApproveState.NOT_APPROVED
                                            ? t('plugin_wallet_token_infinite_unlock')
                                            : ''}
                                    </ActionButton>
                                </Grid>
                            </>
                        )
                    ) : (
                        <Grid item xs={12}>
                            {!account || !chainIdValid ? (
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={onConnectWallet}>
                                    {t('plugin_ito_connect_a_wallet')}
                                </ActionButton>
                            ) : validationMessage ? (
                                <ActionButton className={classes.button} fullWidth variant="contained" disabled>
                                    {validationMessage}
                                </ActionButton>
                            ) : (
                                <ActionButton className={classes.button} fullWidth onClick={onNext} variant="contained">
                                    {t('plugin_ito_next')}
                                </ActionButton>
                            )}
                        </Grid>
                    )}
                </Grid>
            </Box>
        </>
    )
}
