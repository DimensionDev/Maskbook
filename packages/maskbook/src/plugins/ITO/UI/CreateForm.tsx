import { createStyles, makeStyles, Box, TextField, DialogProps, CircularProgress, Typography } from '@material-ui/core'
import CheckIcon from '@material-ui/icons/Check'
import UnCheckIcon from '@material-ui/icons/Close'
import { useState, useCallback, useMemo, useEffect, ChangeEvent } from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { v4 as uuid } from 'uuid'
import Web3Utils from 'web3-utils'
import { LocalizationProvider, MobileDateTimePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ERC20TokenDetailed, EthereumTokenType } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useQualificationVerify } from '../hooks/useQualificationVerify'
import { ITO_CONSTANTS } from '../constants'
import { ExchangeTokenPanelGroup } from './ExchangeTokenPanelGroup'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import type { PoolSettings } from '../hooks/useFillCallback'
import type { ExchangeTokenAndAmountState } from '../hooks/useExchangeTokenAmountstate'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { formatAmount, formatBalance } from '../../Wallet/formatter'
import { sliceTextByUILength } from '../../../utils/getTextUILength'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { AdvanceSetting } from './AdvanceSetting'
import type { AdvanceSettingData } from './AdvanceSetting'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            margin: theme.spacing(1),
            paddingBottom: theme.spacing(2),
            display: 'flex',
        },
        column: {
            flexDirection: 'column',
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
        button: {
            marginTop: theme.spacing(1.5),
        },
        date: {
            margin: theme.spacing(1),
            display: 'flex',
            '& > * ': {
                flex: 1,
                padding: theme.spacing(1),
            },
        },
        iconWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 26,
            height: 24,
            borderRadius: 500,
        },
        success: {
            backgroundColor: 'rgba(119, 224, 181, 0.2)',
        },
        fail: {
            backgroundColor: 'rgba(255, 78, 89, 0.2)',
        },
        qualStartTime: {
            padding: '0 16px',
            opacity: 0.8,
        },
    }),
)

export interface CreateFormProps extends withClasses<never> {
    onChangePoolSettings: (pollSettings: PoolSettings) => void
    onNext: () => void
    origin?: PoolSettings
    dateDialogProps: Partial<DialogProps>
}

export function CreateForm(props: CreateFormProps) {
    const { onChangePoolSettings, onNext, origin } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const DEFAULT_QUALIFICATION_ADDRESS = useConstant(ITO_CONSTANTS, 'DEFAULT_QUALIFICATION_ADDRESS')

    const currentIdentity = useCurrentIdentity()
    const senderName = currentIdentity?.identifier.userId ?? currentIdentity?.linkedPersona?.nickname ?? 'Unknown User'

    const [message, setMessage] = useState(origin?.title ?? '')
    const [totalOfPerWallet, setTotalOfPerWallet] = useState(
        new BigNumber(origin?.limit || '0').isZero()
            ? ''
            : formatBalance(origin?.limit || '0', origin?.token?.decimals),
    )
    const [tokenAndAmount, setTokenAndAmount] = useState<ExchangeTokenAndAmountState>()
    const TAS: ExchangeTokenAndAmountState[] = []
    if (origin?.token && origin?.total) {
        TAS.push({
            token: origin?.token,
            amount: formatBalance(origin?.total || '0', origin?.token.decimals),
            key: uuid(),
        })
    }
    if (origin?.exchangeTokens && origin?.exchangeAmounts) {
        origin?.exchangeTokens.map((i, x) =>
            TAS.push({
                amount: formatBalance(origin?.exchangeAmounts[x] || '0', i?.decimals),
                token: i,
                key: uuid(),
            }),
        )
    }

    // set the default exchange
    if (TAS.length === 1) {
        TAS.push({
            key: uuid(),
            amount: '',
            token: undefined,
        })
    }

    const [tokenAndAmounts, setTokenAndAmounts] = useState<ExchangeTokenAndAmountState[]>(TAS)

    const [startTime, setStartTime] = useState(origin?.startTime || new Date())
    const [endTime, setEndTime] = useState(origin?.endTime || new Date())
    const [unlockTime, setUnlockTime] = useState(origin?.unlockTime || new Date())

    const GMT = (new Date().getTimezoneOffset() / 60) * -1

    // amount for displaying
    const inputTokenAmount = formatAmount(tokenAndAmount?.amount || '0', tokenAndAmount?.token?.decimals)

    // balance
    const { value: tokenBalance = '0' } = useTokenBalance(
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

    // qualificationAddress
    const [qualificationAddress, setQualificationAddress] = useState('')
    const { value: qualification, loading: loadingQualification } = useQualificationVerify(qualificationAddress)

    useEffect(() => {
        const [first, ...rest] = tokenAndAmounts
        setTokenAndAmount(first)
        onChangePoolSettings({
            // this is the raw password which should be signed by the sender
            password: Web3Utils.sha3(`${message}`) ?? '',
            name: senderName,
            title: message,
            limit: formatAmount(totalOfPerWallet || '0', first?.token?.decimals),
            token: first?.token as ERC20TokenDetailed,
            total: formatAmount(first?.amount || '0', first?.token?.decimals),
            exchangeAmounts: rest.map((item) => formatAmount(item.amount || '0', item?.token?.decimals)),
            exchangeTokens: rest.map((item) => item.token!),
            startTime,
            qualificationAddress: qualification?.isQualification ? qualificationAddress : DEFAULT_QUALIFICATION_ADDRESS,
            endTime,
            unlockTime: unlockTime > endTime ? unlockTime : undefined,
            qualificationStartTime: qualification?.startTime ? Number(qualification?.startTime) * 1000 : 0,
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
        unlockTime,
        qualification,
        qualificationAddress,
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

        if (new BigNumber(tokenAndAmount?.amount ?? '0').isGreaterThan(tokenBalance))
            return t('plugin_ito_error_balance', {
                symbol: tokenAndAmount?.token?.symbol,
            })

        if (!totalOfPerWallet || new BigNumber(totalOfPerWallet).isZero())
            return t('plugin_ito_error_allocation_absence')

        if (new BigNumber(totalOfPerWallet).isGreaterThan(new BigNumber(tokenAndAmount?.amount ?? '0')))
            return t('plugin_ito_error_allocation_invalid')

        if (startTime >= endTime) return t('plugin_ito_error_exchange_time')

        if (endTime >= unlockTime) return t('plugin_ito_error_unlock_time')

        if (qualification && qualification.startTime) {
            if (new Date(Number(qualification.startTime) * 1000) >= endTime)
                return t('plugin_ito_error_qualification_start_time')
        }

        return ''
    }, [
        endTime,
        unlockTime,
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

    const handleUnlockTime = useCallback(
        (date: Date) => {
            const time = date.getTime()
            const now = Date.now()
            if (time < now) return
            if (time > endTime.getTime()) setUnlockTime(date)
        },
        [startTime],
    )

    const StartTime = (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDateTimePicker
                showTodayButton
                ampm={false}
                label={t('plugin_ito_begin_time', { zone: GMT >= 0 ? `(UTC +${GMT})` : `(UTC ${GMT})` })}
                onChange={(date: Date | null) => handleStartTime(date!)}
                renderInput={(props) => <TextField {...props} style={{ width: '100%' }} />}
                value={startTime}
                DialogProps={props.dateDialogProps}
            />
        </LocalizationProvider>
    )

    const EndTime = (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDateTimePicker
                showTodayButton
                ampm={false}
                label={t('plugin_ito_end_time', { zone: GMT >= 0 ? `(UTC +${GMT})` : `(UTC ${GMT})` })}
                onChange={(date: Date | null) => handleEndTime(date!)}
                renderInput={(props) => <TextField {...props} style={{ width: '100%' }} />}
                value={endTime}
                DialogProps={props.dateDialogProps}
            />
        </LocalizationProvider>
    )

    const UnlockTime = (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDateTimePicker
                showTodayButton
                ampm={false}
                label={t('plugin_ito_unlock_time', { zone: GMT >= 0 ? `(UTC +${GMT})` : `(UTC ${GMT})` })}
                onChange={(date: Date | null) => handleUnlockTime(date!)}
                renderInput={(props) => <TextField {...props} style={{ width: '100%' }} />}
                value={unlockTime}
                DialogProps={props.dateDialogProps}
            />
        </LocalizationProvider>
    )

    const handleAdvanceSettingChange = (data: AdvanceSettingData) => {
        console.log(data)
    }

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
            {account ? (
                <Box className={classNames(classes.line, classes.column)}>
                    <TextField
                        className={classes.input}
                        label={t('plugin_ito_qualification_label')}
                        onChange={(e) => setQualificationAddress(e.currentTarget.value)}
                        value={qualificationAddress}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            endAdornment:
                                qualification && qualification.isQualification ? (
                                    <Box className={classNames(classes.iconWrapper, classes.success)}>
                                        <CheckIcon fontSize="small" style={{ color: '#77E0B5' }} />
                                    </Box>
                                ) : (qualification && qualification.loadingERC165) || loadingQualification ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <Box className={classNames(classes.iconWrapper, classes.fail)}>
                                        <UnCheckIcon fontSize="small" style={{ color: '#ff4e59' }} />
                                    </Box>
                                ),
                        }}
                    />
                    {qualification &&
                    qualification.startTime &&
                    new Date(Number(qualification.startTime) * 1000) > startTime ? (
                        <div className={classes.qualStartTime}>
                            <Typography>{t('plugin_ito_qualification_start_time')}</Typography>
                            <Typography>{new Date(Number(qualification.startTime) * 1000).toString()}</Typography>
                        </div>
                    ) : null}
                </Box>
            ) : null}
            <Box className={classes.date}>{UnlockTime}</Box>
            <Box className={classes.line}>
                <AdvanceSetting onSettingChange={handleAdvanceSettingChange} />
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
