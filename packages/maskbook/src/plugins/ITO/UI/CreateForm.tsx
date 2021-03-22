import { createStyles, makeStyles, Box, TextField, Grid, FormControlLabel, Checkbox } from '@material-ui/core'
import { useState, useCallback, useMemo, useEffect, ChangeEvent } from 'react'
import BigNumber from 'bignumber.js'
import { v4 as uuid } from 'uuid'
import Web3Utils from 'web3-utils'
import { LocalizationProvider, MobileDateTimePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ERC20TokenDetailed, EthereumTokenType } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { ExchangeTokenPanelGroup } from './ExchangeTokenPanelGroup'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import type { PoolSettings } from '../hooks/useFillCallback'
import type { ExchangeTokenAndAmountState } from '../hooks/useExchangeTokenAmountstate'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { formatAmount, formatBalance } from '../../Wallet/formatter'
import { usePortalShadowRoot } from '../../../utils/shadow-root/usePortalShadowRoot'
import { sliceTextByUILength } from '../../../utils/getTextUILength'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { Flags } from '../../../utils/flags'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            margin: theme.spacing(1),
            paddingBottom: theme.spacing(2),
            display: 'flex',
        },
        flow: {
            margin: theme.spacing(1),
            textAlign: 'center',
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
        button: {},
        date: {
            margin: theme.spacing(1),
            display: 'flex',
            '& > * ': {
                flex: 1,
                padding: theme.spacing(1),
            },
        },
    }),
)

export interface CreateFormProps extends withClasses<never> {
    onChangePoolSettings: (pollSettings: PoolSettings) => void
    onNext: () => void
    origin?: PoolSettings
}

export function CreateForm(props: CreateFormProps) {
    const { onChangePoolSettings, onNext, origin } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')

    const currentIdentity = useCurrentIdentity()
    const senderName = currentIdentity?.identifier.userId ?? currentIdentity?.linkedPersona?.nickname ?? 'Unknown User'

    const [message, setMessage] = useState(origin?.title ?? '')
    const [totalOfPerWallet, setTotalOfPerWallet] = useState(
        new BigNumber(origin?.limit || '0').isZero()
            ? ''
            : formatBalance(new BigNumber(origin?.limit || '0'), origin?.token?.decimals ?? 0),
    )
    const [tokenAndAmount, setTokenAndAmount] = useState<ExchangeTokenAndAmountState>()
    const TAS: ExchangeTokenAndAmountState[] = []
    if (origin?.token && origin?.total) {
        TAS.push({
            token: origin?.token,
            amount: formatBalance(new BigNumber(origin?.total || '0'), origin?.token.decimals ?? 0),
            key: uuid(),
        })
    }
    if (origin?.exchangeTokens && origin?.exchangeAmounts) {
        origin?.exchangeTokens.map((i, x) =>
            TAS.push({
                amount: formatBalance(new BigNumber(origin?.exchangeAmounts[x] || '0'), i?.decimals ?? 0),
                token: i,
                key: uuid(),
            }),
        )
    }

    const [tokenAndAmounts, setTokenAndAmounts] = useState<ExchangeTokenAndAmountState[]>(TAS)

    const [startTime, setStartTime] = useState(origin?.startTime || new Date())
    const [endTime, setEndTime] = useState(origin?.endTime || new Date())

    const GMT = (new Date().getTimezoneOffset() / 60) * -1

    // amount for displaying
    const inputTokenAmount = formatAmount(
        new BigNumber(tokenAndAmount?.amount || '0'),
        tokenAndAmount?.token?.decimals ?? 0,
    )

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        tokenAndAmount?.token?.type ?? EthereumTokenType.Ether,
        tokenAndAmount?.token?.address ?? '',
    )

    const onTotalOfPerWalletChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const total = ev.currentTarget.value
        if (total === '') setTotalOfPerWallet('')
        if (/^\d+[\.]?\d*$/.test(total)) {
            setTotalOfPerWallet(total)
        }
    }, [])

    useEffect(() => {
        const [first, ...rest] = tokenAndAmounts
        setTokenAndAmount(first)
        onChangePoolSettings({
            isMask: false,
            // this is the raw password which should be signed by the sender
            password: Web3Utils.sha3(`${message}`) ?? '',
            name: senderName,
            title: message,
            limit: formatAmount(new BigNumber(totalOfPerWallet || '0'), first?.token?.decimals ?? 0),
            token: first?.token as ERC20TokenDetailed,
            total: formatAmount(new BigNumber(first?.amount || '0'), first?.token?.decimals ?? 0),
            exchangeAmounts: rest.map((item) =>
                formatAmount(new BigNumber(item.amount || '0'), item?.token?.decimals ?? 0),
            ),
            exchangeTokens: rest.map((item) => item.token!),
            startTime: startTime,
            endTime: endTime,
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
        if (tokenAndAmounts.length === 0) return t('plugin_ito_error_enter_amount_and_token')
        for (const { amount, token } of tokenAndAmounts) {
            if (!token) return t('plugin_ito_error_select_token')
            if (amount === '') return t('plugin_ito_error_enter_amount')
            if (new BigNumber(amount).isZero()) return t('plugin_ito_error_enter_amount')
        }

        if (new BigNumber(tokenAndAmount?.amount ?? '0').isGreaterThan(new BigNumber(tokenBalance)))
            return t('plugin_ito_error_balance', {
                symbol: tokenAndAmount?.token?.symbol,
            })

        if (!totalOfPerWallet || new BigNumber(totalOfPerWallet).isZero())
            return t('plugin_ito_error_allocation_absence')

        if (new BigNumber(totalOfPerWallet).isGreaterThan(new BigNumber(tokenAndAmount?.amount ?? '0')))
            return t('plugin_ito_error_allocation_invalid')

        if (startTime >= endTime) return t('plugin_ito_error_exchange_time')

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

    const handleStartTime = useCallback((date: Date) => {
        setStartTime(date)
    }, [])

    const handleEndTime = useCallback(
        (date: Date) => {
            const time = date.getTime()
            const now = Date.now()
            if (time < now) return
            if (time > startTime.getTime()) setEndTime(date)
        },
        [startTime],
    )

    const StartTime = usePortalShadowRoot((container) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDateTimePicker
                showTodayButton
                ampm={false}
                label={t('plugin_ito_begin_time', { zone: GMT >= 0 ? `(UTC +${GMT})` : `(UTC ${GMT})` })}
                onChange={(date: Date | null) => handleStartTime(date!)}
                renderInput={(props) => <TextField {...props} style={{ width: '100%' }} />}
                value={startTime}
                DialogProps={{ container }}
            />
        </LocalizationProvider>
    ))
    const EndTime = usePortalShadowRoot((container) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDateTimePicker
                showTodayButton
                ampm={false}
                label={t('plugin_ito_end_time', { zone: GMT >= 0 ? `(UTC +${GMT})` : `(UTC ${GMT})` })}
                onChange={(date: Date | null) => handleEndTime(date!)}
                renderInput={(props) => <TextField {...props} style={{ width: '100%' }} />}
                value={endTime}
                DialogProps={{ container }}
            />
        </LocalizationProvider>
    ))
    return (
        <>
            <Box className={classes.line} style={{ display: 'block' }}>
                <ExchangeTokenPanelGroup
                    token={tokenAndAmount?.token}
                    origin={tokenAndAmounts}
                    onTokenAmountChange={(arr) => setTokenAndAmounts(arr)}
                />
            </Box>
            <Box className={classes.line}>
                <TextField
                    className={classes.input}
                    label={t('plugin_item_message_label')}
                    value={message}
                    onChange={(e) => setMessage(sliceTextByUILength(e.target.value, 90))}
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
            <Box className={classes.date}>
                {StartTime} {EndTime}
            </Box>
            <Box className={classes.line}>
                <EthereumWalletConnectedBoundary>
                    <EthereumERC20TokenApprovedBoundary
                        amount={inputTokenAmount}
                        spender={ITO_CONTRACT_ADDRESS}
                        token={
                            tokenAndAmount?.token?.type === EthereumTokenType.ERC20 ? tokenAndAmount.token : undefined
                        }>
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={!!validationMessage}
                            onClick={onNext}>
                            {validationMessage || t('plugin_ito_next')}
                        </ActionButton>
                    </EthereumERC20TokenApprovedBoundary>
                </EthereumWalletConnectedBoundary>
            </Box>
        </>
    )
}
