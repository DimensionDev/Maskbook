import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import Web3Utils from 'web3-utils'
import formatDateTime from 'date-fns/format'
import { SchemaType, formatAmount, useITOConstants, type ChainId } from '@masknet/web3-shared-evm'
import { isGreaterThan, isZero, type FungibleToken, leftShift } from '@masknet/web3-shared-base'
import {
    TokenIcon,
    PluginWalletStatusBar,
    WalletConnectedBoundary,
    DateTimePanel,
    EthereumERC20TokenApprovedBoundary,
} from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { Box, Stack, Typography, InputBase, inputBaseClasses } from '@mui/material'
import { makeStyles, ActionButton, LoadingBase } from '@masknet/theme'
import { Check as CheckIcon, Close as UnCheckIcon } from '@mui/icons-material'
import type { ExchangeTokenAndAmountState } from './hooks/useExchangeTokenAmountstate.js'
import type { PoolSettings } from './hooks/useFill.js'
import { useQualificationVerify } from './hooks/useQualificationVerify.js'
import { decodeRegionCode, encodeRegionCode, regionCodes, useRegionSelect } from './hooks/useRegion.js'
import { type AdvanceSettingData, AdvanceSetting } from './AdvanceSetting.js'
import { ExchangeTokenPanelGroup } from './ExchangeTokenPanelGroup.js'
import { RegionSelect } from './RegionSelect.js'
import { useChainContext, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { useI18N } from '../locales/index.js'
import { sliceTextByUILength } from './utils/sliceTextByUILength.js'
import { useCurrentLinkedPersona } from './hooks/useCurrentLinkedPersona.js'

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
        input: {
            position: 'relative',
            height: 66,
            padding: theme.spacing(1.25, 1.5),
            [`& > .${inputBaseClasses.input}`]: {
                padding: theme.spacing(2.75, 0, 0, 0),
                flex: 2,
            },
        },
        inputLabel: {
            position: 'absolute',
            left: 12,
            top: 10,
            fontSize: 13,
            lineHeight: '18px',
            color: theme.palette.maskColor.second,
            whiteSpace: 'nowrap',
        },
        date: {
            margin: theme.spacing(1),
            display: 'flex',
            columnGap: 12,
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
        controller: {
            position: 'sticky',
            bottom: 0,
        },
        tokenAdornment: {
            display: 'flex',
            columnGap: 4,
            alignItems: 'center',
            paddingRight: 11,
        },
        tokenIcon: {
            width: 18,
            height: 18,
        },
    }
})

export interface CreateFormProps {
    onChangePoolSettings: (pollSettings: PoolSettings) => void
    onNext: () => void
    origin?: PoolSettings
}

export function CreateForm(props: CreateFormProps) {
    const { onChangePoolSettings, onNext, origin } = props
    const t = useI18N()
    const { classes, cx } = useStyles()

    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { ITO2_CONTRACT_ADDRESS, DEFAULT_QUALIFICATION2_ADDRESS } = useITOConstants(chainId)

    const currentIdentity = useCurrentVisitingIdentity()
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const linkedPersona = useCurrentLinkedPersona()

    const senderName =
        lastRecognizedIdentity?.identifier?.userId ??
        currentIdentity?.identifier?.userId ??
        linkedPersona?.nickname ??
        'Unknown User'

    const [message, setMessage] = useState(origin?.title ?? '')
    const [totalOfPerWallet, setTotalOfPerWallet] = useState(
        isZero(origin?.limit || '0') ? '' : leftShift(origin?.limit ?? '0', origin?.token?.decimals).toFixed(),
    )
    const [tokenAndAmount, setTokenAndAmount] = useState<ExchangeTokenAndAmountState>()
    const TAS: ExchangeTokenAndAmountState[] = []
    if (origin?.token && origin?.total) {
        TAS.push({
            token: origin?.token,
            amount: leftShift(origin?.total ?? '0', origin?.token.decimals).toFixed(),
            key: uuid(),
        })
    }
    if (origin?.exchangeTokens && origin?.exchangeAmounts) {
        origin?.exchangeTokens.map((i, x) =>
            TAS.push({
                amount: leftShift(origin?.exchangeAmounts[x] || '0', i?.decimals).toFixed(),
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

    // amount for displaying
    const inputTokenAmount = formatAmount(tokenAndAmount?.amount || '0', tokenAndAmount?.token?.decimals)

    // balance
    const { data: tokenBalance = '0' } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
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
        const [first, ...rest] = tokenAndAmounts
        const qualificationAddress_ =
            qualification?.isQualification && advanceSettingData.contract
                ? qualificationAddress
                : DEFAULT_QUALIFICATION2_ADDRESS
        if (!qualificationAddress_) return
        setTokenAndAmount(first)
        onChangePoolSettings({
            // this is the raw password which should be signed by the sender
            password: Web3Utils.sha3(message) ?? '',
            name: senderName,
            title: message,
            limit: formatAmount(totalOfPerWallet || '0', first?.token?.decimals),
            token: first?.token as FungibleToken<ChainId, SchemaType.ERC20>,
            total: formatAmount(first?.amount || '0', first?.token?.decimals),
            exchangeAmounts: rest.map((item) => formatAmount(item.amount || '0', item?.token?.decimals)),
            exchangeTokens: rest.map((item) => item.token!) as Array<
                FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>
            >,
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

    useEffect(() => {
        const date = new Date()
        setMessage('')
        setTotalOfPerWallet('')
        setAdvanceSettingData({})
        setStartTime(date)
        setEndTime(date)
        setUnlockTime(date)
        setQualificationAddress('')
    }, [chainId])

    const validationMessage = useMemo(() => {
        if (tokenAndAmounts.length === 0) return t.plugin_ito_error_enter_amount_and_token()
        for (const { amount, token } of tokenAndAmounts) {
            if (!token) return t.plugin_ito_error_select_token()
            if (amount === '') return t.plugin_ito_error_enter_amount()
            if (isZero(amount)) return t.plugin_ito_error_enter_amount()
        }

        if (isGreaterThan(tokenAndAmount?.amount ?? '0', tokenBalance))
            return t.plugin_ito_error_balance({
                symbol: tokenAndAmount?.token?.symbol || '',
            })

        if (!totalOfPerWallet || isZero(totalOfPerWallet)) return t.plugin_ito_error_allocation_absence()

        if (isGreaterThan(totalOfPerWallet, tokenAndAmount?.amount ?? '0'))
            return t.plugin_ito_error_allocation_invalid()

        if (startTime >= endTime) return t.plugin_ito_error_exchange_time()

        if (endTime >= unlockTime && advanceSettingData.delayUnlocking) return t.plugin_ito_error_unlock_time()

        if (qualification?.startTime) {
            if (new Date(Number(qualification.startTime) * 1000) >= endTime)
                return t.plugin_ito_error_qualification_start_time()
        }

        if (!qualification?.isQualification && advanceSettingData.contract && qualificationAddress.length > 0) {
            return t.plugin_ito_error_invalid_qualification()
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

    const StartTime = (
        <DateTimePanel label={t.plugin_ito_begin_time_title()} onChange={handleStartTime} date={startTime} />
    )

    const EndTime = (
        <DateTimePanel
            label={t.plugin_ito_end_time_title()}
            onChange={handleEndTime}
            min={formatDateTime(startTime, "yyyy-MM-dd'T00:00")}
            date={endTime}
        />
    )

    const UnlockTime = (
        <DateTimePanel label={t.plugin_ito_unlock_time()} onChange={handleUnlockTime} date={unlockTime} />
    )

    return (
        <>
            <Box className={classes.line} style={{ display: 'block' }}>
                <ExchangeTokenPanelGroup
                    token={tokenAndAmount?.token}
                    origin={tokenAndAmounts}
                    onTokenAmountChange={(arr) => setTokenAndAmounts(arr)}
                    chainId={chainId}
                />
            </Box>
            <Box className={classes.line}>
                <InputBase
                    placeholder={t.plugin_ito_message_label()}
                    value={message}
                    onChange={(e) => setMessage(sliceTextByUILength(e.target.value, 90))}
                    fullWidth
                />
            </Box>
            <Box className={classes.line}>
                <InputBase
                    fullWidth
                    placeholder={t.plugin_ito_allocation_per_wallet_title()}
                    onChange={onTotalOfPerWalletChange}
                    value={totalOfPerWallet}
                    inputProps={{
                        autoComplete: 'off',
                        autoCorrect: 'off',
                        inputMode: 'decimal',
                        pattern: '^[0-9]$',
                        spellCheck: false,
                    }}
                    endAdornment={
                        tokenAndAmount?.token ? (
                            <Box className={classes.tokenAdornment}>
                                <TokenIcon className={classes.tokenIcon} {...tokenAndAmount.token} />
                                <Typography>{tokenAndAmount.token?.symbol}</Typography>
                            </Box>
                        ) : null
                    }
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
                    <InputBase
                        startAdornment={
                            <Typography className={classes.inputLabel}>{t.plugin_ito_region_label()}</Typography>
                        }
                        className={classes.input}
                        inputComponent={RegionSelect}
                        inputProps={{ value: regions, onRegionChange: setRegions }}
                        fullWidth
                    />
                </Box>
            ) : null}
            {advanceSettingData.delayUnlocking ? <Box className={classes.date}>{UnlockTime}</Box> : null}
            {account && advanceSettingData.contract ? (
                <Box className={cx(classes.line, classes.column)}>
                    <InputBase
                        className={classes.input}
                        onChange={(e) => setQualificationAddress(e.currentTarget.value)}
                        value={qualificationAddress}
                        startAdornment={
                            <Typography className={classes.inputLabel}>{t.plugin_ito_qualification_label()}</Typography>
                        }
                        endAdornment={
                            qualification?.isQualification ? (
                                <Box className={cx(classes.iconWrapper, classes.success)}>
                                    <CheckIcon fontSize="small" style={{ color: '#77E0B5' }} />
                                </Box>
                            ) : qualification?.loadingERC165 || loadingQualification ? (
                                <LoadingBase size={16} />
                            ) : qualificationAddress.length > 0 ? (
                                <Box className={cx(classes.iconWrapper, classes.fail)}>
                                    <UnCheckIcon fontSize="small" style={{ color: '#ff4e59' }} />
                                </Box>
                            ) : null
                        }
                        placeholder="0x"
                    />
                    {qualification?.startTime && new Date(Number(qualification.startTime) * 1000) > startTime ? (
                        <div className={classes.qualStartTime}>
                            <Typography>{t.plugin_ito_qualification_start_time()}</Typography>
                            <Typography>{new Date(Number(qualification.startTime) * 1000).toString()}</Typography>
                        </div>
                    ) : null}
                </Box>
            ) : null}

            <PluginWalletStatusBar className={classes.controller}>
                <WalletConnectedBoundary expectedChainId={chainId}>
                    <EthereumERC20TokenApprovedBoundary
                        amount={inputTokenAmount}
                        spender={ITO2_CONTRACT_ADDRESS}
                        token={tokenAndAmount?.token?.schema === SchemaType.ERC20 ? tokenAndAmount.token : undefined}>
                        <ActionButton
                            fullWidth
                            variant="contained"
                            size="medium"
                            disabled={!!validationMessage}
                            onClick={onNext}>
                            {validationMessage || t.plugin_ito_next()}
                        </ActionButton>
                    </EthereumERC20TokenApprovedBoundary>
                </WalletConnectedBoundary>
            </PluginWalletStatusBar>
        </>
    )
}
