import {
    ERC20TokenDetailed,
    EthereumTokenType,
    formatAmount,
    formatBalance,
    useAccount,
    useITOConstants,
    useFungibleTokenBalance,
} from '@masknet/web3-shared-evm'
import { isGreaterThan, isZero } from '@masknet/web3-shared-base'
import { Box, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import CheckIcon from '@mui/icons-material/Check'
import UnCheckIcon from '@mui/icons-material/Close'
import classNames from 'classnames'
import formatDateTime from 'date-fns/format'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import Web3Utils from 'web3-utils'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { sliceTextByUILength, useI18N } from '../../../utils'
import { DateTimePanel } from '../../../web3/UI/DateTimePanel'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import type { ExchangeTokenAndAmountState } from './hooks/useExchangeTokenAmountstate'
import type { PoolSettings } from './hooks/useFill'
import { useQualificationVerify } from './hooks/useQualificationVerify'
import { decodeRegionCode, encodeRegionCode, regionCodes, useRegionSelect } from './hooks/useRegion'
import { AdvanceSettingData, AdvanceSetting } from './AdvanceSetting'
import { ExchangeTokenPanelGroup } from './ExchangeTokenPanelGroup'
import { RegionSelect } from './RegionSelect'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        line: {
            margin: theme.spacing(1),
            paddingBottom: theme.spacing(2),
            display: 'flex',
            [smallQuery]: {
                margin: theme.spacing(0),
            },
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
        inputLabel: {
            left: 8,
            top: 8,
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
            [smallQuery]: {
                lineHeight: 1.2,
                marginTop: theme.spacing(0),
            },
        },
        date: {
            margin: theme.spacing(1),
            display: 'flex',
            '& > * ': {
                flex: 1,
                padding: theme.spacing(1),
                [smallQuery]: {
                    flexDirection: 'column',
                    padding: theme.spacing(2, 0, 1, 0),
                },
            },
            [smallQuery]: {
                flexDirection: 'column',
                paddingLeft: 0,
                paddingRight: 0,
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
        field: {
            flex: 1,
            padding: theme.spacing(1),
            marginTop: theme.spacing(1),
        },
    }
})

export interface CreateFormProps extends withClasses<never> {
    onChangePoolSettings: (pollSettings: PoolSettings) => void
    onNext: () => void
    onClose: () => void
    origin?: PoolSettings
}

export function CreateForm(props: CreateFormProps) {
    const { onChangePoolSettings, onNext, origin, onClose } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const { ITO2_CONTRACT_ADDRESS, DEFAULT_QUALIFICATION2_ADDRESS } = useITOConstants()

    const currentIdentity = useCurrentIdentity()
    const senderName = currentIdentity?.identifier.userId ?? currentIdentity?.linkedPersona?.nickname ?? 'Unknown User'

    const [message, setMessage] = useState(origin?.title ?? '')
    const [totalOfPerWallet, setTotalOfPerWallet] = useState(
        isZero(origin?.limit || '0') ? '' : formatBalance(origin?.limit || '0', origin?.token?.decimals),
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
    const { value: tokenBalance = '0' } = useFungibleTokenBalance(
        tokenAndAmount?.token?.type ?? EthereumTokenType.Native,
        tokenAndAmount?.token?.address ?? '',
    )

    const RE_MATCH_WHOLE_AMOUNT = useMemo(
        () => new RegExp(`^\\d*\\.?\\d{0,${tokenAndAmount?.token?.decimals ?? 18}}$`), // d.ddd...d
        [tokenAndAmount?.token?.decimals],
    )

    const onTotalOfPerWalletChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const total = ev.currentTarget.value
            if (!RE_MATCH_WHOLE_AMOUNT.test(total)) return
            if (total === '') setTotalOfPerWallet('')
            if (/^\d+\.?\d*$/.test(total)) {
                setTotalOfPerWallet(total)
            }
        },
        [tokenAndAmount?.token?.decimals, RE_MATCH_WHOLE_AMOUNT],
    )

    // qualificationAddress
    const [qualificationAddress, setQualificationAddress] = useState(
        origin?.qualificationAddress && origin.qualificationAddress !== DEFAULT_QUALIFICATION2_ADDRESS
            ? origin.qualificationAddress
            : '',
    )
    const { value: qualification, loading: loadingQualification } = useQualificationVerify(
        qualificationAddress,
        ITO2_CONTRACT_ADDRESS,
    )

    // advance settings
    const [advanceSettingData, setAdvanceSettingData] = useState<AdvanceSettingData>(origin?.advanceSettingData || {})

    // restrict regions
    const [regions, setRegions] = useRegionSelect(decodeRegionCode(origin?.regions ?? '-'))

    useEffect(() => {
        if (!advanceSettingData.contract) setQualificationAddress('')
        if (!advanceSettingData.delayUnlocking) setUnlockTime(new Date())
        if (!advanceSettingData.IPRegion) setRegions(regionCodes)
    }, [advanceSettingData])

    useEffect(() => {
        if (!ITO2_CONTRACT_ADDRESS || !DEFAULT_QUALIFICATION2_ADDRESS) onClose()
    }, [ITO2_CONTRACT_ADDRESS, DEFAULT_QUALIFICATION2_ADDRESS, onClose])

    useEffect(() => {
        const [first, ...rest] = tokenAndAmounts
        const qualificationAddress_ =
            qualification?.isQualification && advanceSettingData.contract
                ? qualificationAddress
                : DEFAULT_QUALIFICATION2_ADDRESS
        if (!qualificationAddress_) return
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
            qualificationAddress: qualificationAddress_,
            startTime,
            endTime,
            unlockTime: unlockTime > endTime && advanceSettingData.delayUnlocking ? unlockTime : undefined,
            regions: encodeRegionCode(regions),
            advanceSettingData,
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
        regions,
        qualificationAddress,
        account,
        onChangePoolSettings,
        DEFAULT_QUALIFICATION2_ADDRESS,
    ])

    const validationMessage = useMemo(() => {
        if (tokenAndAmounts.length === 0) return t('plugin_ito_error_enter_amount_and_token')
        for (const { amount, token } of tokenAndAmounts) {
            if (!token) return t('plugin_ito_error_select_token')
            if (amount === '') return t('plugin_ito_error_enter_amount')
            if (isZero(amount)) return t('plugin_ito_error_enter_amount')
        }

        if (isGreaterThan(tokenAndAmount?.amount ?? '0', tokenBalance))
            return t('plugin_ito_error_balance', {
                symbol: tokenAndAmount?.token?.symbol,
            })

        if (!totalOfPerWallet || isZero(totalOfPerWallet)) return t('plugin_ito_error_allocation_absence')

        if (isGreaterThan(totalOfPerWallet, tokenAndAmount?.amount ?? '0'))
            return t('plugin_ito_error_allocation_invalid')

        if (startTime >= endTime) return t('plugin_ito_error_exchange_time')

        if (endTime >= unlockTime && advanceSettingData.delayUnlocking) return t('plugin_ito_error_unlock_time')

        if (qualification?.startTime) {
            if (new Date(Number(qualification.startTime) * 1000) >= endTime)
                return t('plugin_ito_error_qualification_start_time')
        }

        if (!qualification?.isQualification && advanceSettingData.contract && qualificationAddress.length > 0) {
            return t('plugin_ito_error_invalid_qualification')
        }
        return ''
    }, [
        endTime,
        unlockTime,
        advanceSettingData,
        qualification,
        startTime,
        tokenAndAmount?.amount,
        tokenAndAmount?.token?.symbol,
        tokenAndAmounts,
        tokenBalance,
        totalOfPerWallet,
    ])

    const handleStartTime = useCallback((input: Date) => {
        setStartTime(input)
    }, [])

    const handleEndTime = useCallback(
        (input: Date) => {
            const time = input.getTime()
            const now = Date.now()
            if (time < now) return
            if (time > startTime.getTime()) setEndTime(input)
        },
        [startTime],
    )

    const handleUnlockTime = useCallback(
        (input: Date) => {
            const time = input.getTime()
            const now = Date.now()
            if (time < now) return
            if (time > endTime.getTime()) setUnlockTime(input)
        },
        [startTime],
    )

    const StartTime = <DateTimePanel label={t('plugin_ito_begin_time')} onChange={handleStartTime} date={startTime} />

    const EndTime = (
        <DateTimePanel
            label={t('plugin_ito_end_time')}
            onChange={handleEndTime}
            min={formatDateTime(startTime, "yyyy-MM-dd'T00:00")}
            date={endTime}
        />
    )

    const UnlockTime = (
        <DateTimePanel label={t('plugin_ito_unlock_time')} onChange={handleUnlockTime} date={unlockTime} />
    )

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
                    label={t('plugin_ito_message_label')}
                    value={message}
                    onChange={(e) => setMessage(sliceTextByUILength(e.target.value, 90))}
                    InputLabelProps={{
                        shrink: true,
                        classes: {
                            root: classes.inputLabel,
                        },
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
                        classes: {
                            root: classes.inputLabel,
                        },
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
            <Stack className={classes.date} direction="row">
                {StartTime} {EndTime}
            </Stack>
            <Box className={classes.line}>
                <AdvanceSetting advanceSettingData={advanceSettingData} setAdvanceSettingData={setAdvanceSettingData} />
            </Box>
            {advanceSettingData.IPRegion ? (
                <Box className={classes.line}>
                    <TextField
                        className={classes.input}
                        label={t('plugin_ito_region_label')}
                        InputLabelProps={{
                            shrink: true,
                            classes: {
                                root: classes.inputLabel,
                            },
                        }}
                        InputProps={{
                            inputComponent: RegionSelect,
                            inputProps: {
                                value: regions,
                                onRegionChange: setRegions,
                            },
                        }}
                    />
                </Box>
            ) : null}
            {advanceSettingData.delayUnlocking ? <Box className={classes.date}>{UnlockTime}</Box> : null}
            {account && advanceSettingData.contract ? (
                <Box className={classNames(classes.line, classes.column)}>
                    <TextField
                        className={classes.input}
                        label={t('plugin_ito_qualification_label')}
                        onChange={(e) => setQualificationAddress(e.currentTarget.value)}
                        value={qualificationAddress}
                        InputLabelProps={{
                            shrink: true,
                            classes: {
                                root: classes.inputLabel,
                            },
                        }}
                        InputProps={{
                            endAdornment: qualification?.isQualification ? (
                                <Box className={classNames(classes.iconWrapper, classes.success)}>
                                    <CheckIcon fontSize="small" style={{ color: '#77E0B5' }} />
                                </Box>
                            ) : qualification?.loadingERC165 || loadingQualification ? (
                                <CircularProgress size={16} />
                            ) : qualificationAddress.length > 0 ? (
                                <Box className={classNames(classes.iconWrapper, classes.fail)}>
                                    <UnCheckIcon fontSize="small" style={{ color: '#ff4e59' }} />
                                </Box>
                            ) : null,
                        }}
                    />
                    {qualification?.startTime && new Date(Number(qualification.startTime) * 1000) > startTime ? (
                        <div className={classes.qualStartTime}>
                            <Typography>{t('plugin_ito_qualification_start_time')}</Typography>
                            <Typography>{new Date(Number(qualification.startTime) * 1000).toString()}</Typography>
                        </div>
                    ) : null}
                </Box>
            ) : null}
            <Box className={classes.line}>
                <EthereumWalletConnectedBoundary>
                    <EthereumERC20TokenApprovedBoundary
                        amount={inputTokenAmount}
                        spender={ITO2_CONTRACT_ADDRESS}
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
