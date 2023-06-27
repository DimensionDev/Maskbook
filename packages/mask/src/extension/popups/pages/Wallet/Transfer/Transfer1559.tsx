import { memo, type SyntheticEvent, useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { Trans } from 'react-i18next'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'react-feather'
import { toHex } from 'web3-utils'
import { useContainer } from 'unstated-next'
import { mapValues } from 'lodash-es'
import { z as zod } from 'zod'
import { BigNumber } from 'bignumber.js'
import {
    addGasMargin,
    ChainId,
    DepositPaymaster,
    explorerResolver,
    formatEthereumAddress,
    formatGweiToEther,
    formatGweiToWei,
    formatWeiToGwei,
    isNativeTokenAddress,
    isValidAddress,
    isValidDomain,
    SchemaType,
} from '@masknet/web3-shared-evm'
import {
    formatBalance,
    formatCurrency,
    type FungibleAsset,
    isGreaterThan,
    isGreaterThanOrEqualTo,
    isLessThan,
    isLessThanOrEqualTo,
    isPositive,
    isSameAddress,
    isZero,
    minus,
    multipliedBy,
    rightShift,
    toFixed,
} from '@masknet/web3-shared-base'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoadingButton } from '@mui/lab'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Chip, Collapse, Link, MenuItem, Popover, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { NetworkPluginID, NUMERIC_INPUT_REGEXP_PATTERN } from '@masknet/shared-base'
import { FormattedAddress, FormattedBalance, TokenIcon, useMenuConfig } from '@masknet/shared'
import { ExpandMore } from '@mui/icons-material'
import {
    useChainContext,
    useFungibleToken,
    useLookupAddress,
    useNativeTokenPrice,
    useWallet,
    useGasOptions,
    useNetworkContext,
    useMaskTokenAddress,
} from '@masknet/web3-hooks-base'
import { useGasLimit, useTokenTransferCallback } from '@masknet/web3-hooks-evm'
import { Web3 } from '@masknet/web3-providers'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { AccountItem } from './AccountItem.js'
import { TransferAddressError } from '../type.js'
import { useI18N } from '../../../../../utils/index.js'
import Services from '../../../../service.js'
import { PopupContext } from '../../../hook/usePopupContext.js'

const useStyles = makeStyles()({
    container: {
        padding: '16px 16px 0 16px',
        flex: 1,
    },
    label: {
        color: '#1C68F3',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '16px',
        margin: '10px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    accountName: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: '16px',
        color: '#15181B',
    },
    user: {
        stroke: '#15181B',
        fill: 'none',
        fontSize: 20,
        cursor: 'pointer',
    },
    expand: {
        backgroundColor: '#F7F9FA',
        padding: 10,
    },
    title: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#15181B',
        fontWeight: 700,
    },
    balance: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
    },
    max: {
        height: 20,
        borderRadius: 4,
    },
    maxLabel: {
        paddingLeft: 4,
        paddingRight: 4,
        fontSize: 12,
    },
    chip: {
        marginLeft: 6,
        border: 'none',
    },
    icon: {
        fontSize: 20,
        width: 20,
        height: 20,
    },
    unit: {
        color: '#7B8192',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '16px',
        flex: 1,
    },
    price: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#15181B',
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: '10px 16px',
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    popover: {
        width: '100%',
    },
    errorMessage: {
        color: '#FF5F5F',
        fontSize: 16,
        lineHeight: '22px',
        fontWeight: 500,
    },
    normalMessage: {
        color: '#111432',
        fontSize: 16,
        lineHeight: '22px',
        fontWeight: 500,
    },
    domainName: {
        fontWeight: 600,
        lineHeight: '20px',
        color: '#000000',
    },
    registeredAddress: {
        color: '#7B8192',
        lineHeight: '20px',
    },
    menu: {
        left: '16px !important',
        width: '100%',
    },
})
const MIN_GAS_LIMIT = 21000
export interface Transfer1559Props {
    selectedAsset?: FungibleAsset<ChainId, SchemaType>
    otherWallets: Array<{
        name: string
        address: string
    }>
    openAssetMenu: (anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => void
}

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export const Transfer1559 = memo<Transfer1559Props>(({ selectedAsset, openAssetMenu, otherWallets }) => {
    const { t } = useI18N()
    const { classes } = useStyles()

    const { pluginID } = useNetworkContext()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: nativeToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM)

    const navigate = useNavigate()
    const location = useLocation()

    const [minGasLimitContext, setMinGasLimitContext] = useState(0)
    const [addressTip, setAddressTip] = useState<{
        type: TransferAddressError
        message: string
    } | null>()

    const { smartPayChainId } = useContainer(PopupContext)

    const { value: etherPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId: nativeToken?.chainId,
    })

    const { value: gasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })

    const estimateGasFees = useMemo(() => {
        return mapValues(gasOptions, (option) => ({
            ...option,
            suggestedMaxFeePerGas: formatWeiToGwei(option.suggestedMaxFeePerGas),
            suggestedMaxPriorityFeePerGas: formatWeiToGwei(option.suggestedMaxPriorityFeePerGas),
        }))
    }, [gasOptions])

    const schema = useMemo(() => {
        return zod
            .object({
                address: zod
                    .string()
                    .min(1, t('wallet_transfer_error_address_absence'))
                    .refine(
                        (address) => isValidAddress(address) || isValidDomain(address),
                        t('wallet_transfer_error_invalid_address'),
                    ),
                amount: zod
                    .string()
                    .refine((amount) => {
                        const transferAmount = rightShift(amount || '0', selectedAsset?.decimals)
                        return !!transferAmount || !isZero(transferAmount)
                    }, t('wallet_transfer_error_amount_absence'))
                    .refine((amount) => {
                        const transferAmount = rightShift(amount || '0', selectedAsset?.decimals)
                        return !isGreaterThan(transferAmount, selectedAsset?.balance ?? 0)
                    }, t('wallet_transfer_error_insufficient_balance', { symbol: selectedAsset?.symbol })),
                gasLimit: zod
                    .string()
                    .min(1, t('wallet_transfer_error_gas_limit_absence'))
                    .refine(
                        (gasLimit) => isGreaterThanOrEqualTo(gasLimit, minGasLimitContext),
                        t('popups_wallet_gas_fee_settings_min_gas_limit_tips', { limit: minGasLimitContext }),
                    ),
                maxPriorityFeePerGas: zod
                    .string()
                    .min(1, t('wallet_transfer_error_max_priority_fee_absence'))
                    .refine(isPositive, t('wallet_transfer_error_max_priority_gas_fee_positive'))
                    .refine((value) => {
                        return isGreaterThanOrEqualTo(value, estimateGasFees?.slow?.suggestedMaxPriorityFeePerGas ?? 0)
                    }, t('wallet_transfer_error_max_priority_gas_fee_too_low'))
                    .refine(
                        (value) =>
                            isLessThan(
                                value,
                                multipliedBy(
                                    estimateGasFees?.fast?.suggestedMaxPriorityFeePerGas ?? 0,
                                    HIGH_FEE_WARNING_MULTIPLIER,
                                ),
                            ),
                        t('wallet_transfer_error_max_priority_gas_fee_too_high'),
                    ),
                maxFeePerGas: zod
                    .string()
                    .min(1, t('wallet_transfer_error_max_fee_absence'))
                    .refine(
                        (value) => isGreaterThanOrEqualTo(value, estimateGasFees?.slow?.suggestedMaxFeePerGas ?? 0),
                        t('wallet_transfer_error_max_fee_too_low'),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                value,
                                multipliedBy(
                                    estimateGasFees?.fast?.suggestedMaxFeePerGas ?? 0,
                                    HIGH_FEE_WARNING_MULTIPLIER,
                                ),
                            ),
                        t('wallet_transfer_error_max_fee_too_high'),
                    ),
            })
            .refine((data) => isLessThanOrEqualTo(data.maxPriorityFeePerGas, data.maxFeePerGas), {
                message: t('wallet_transfer_error_max_priority_gas_fee_imbalance'),
                path: ['maxFeePerGas'],
            })
    }, [wallet, selectedAsset, minGasLimitContext, estimateGasFees])

    const methods = useForm<zod.infer<typeof schema>>({
        shouldUnregister: false,
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            address: '',
            amount: '',
            gasLimit: selectedAsset?.schema === SchemaType.Native ? '21000' : '0',
            maxPriorityFeePerGas: '',
            maxFeePerGas: '',
        },
        context: {
            wallet,
            minGasLimitContext,
            estimateGasFees,
            selectedAsset,
        },
    })

    const [address, amount, maxFeePerGas, gasLimit] = methods.watch(['address', 'amount', 'maxFeePerGas', 'gasLimit'])

    // #region resolve ENS domain
    const {
        value: registeredAddress = '',
        error: resolveDomainError,
        loading: resolveDomainLoading,
    } = useLookupAddress(NetworkPluginID.PLUGIN_EVM, address)
    // #endregion

    // #region check address or registered address type
    useAsync(async () => {
        // Only ethereum currently supports ens
        if (address.includes('.eth') && pluginID !== NetworkPluginID.PLUGIN_EVM) {
            setAddressTip({
                type: TransferAddressError.NETWORK_NOT_SUPPORT,
                message: t('wallet_transfer_error_no_support_ens'),
            })
            return
        }

        // The input is ens domain but the binding address cannot be found
        if (isValidDomain(address) && (resolveDomainError || !registeredAddress)) {
            setAddressTip({
                type: TransferAddressError.RESOLVE_FAILED,
                message: t('wallet_transfer_error_no_address_has_been_set_name'),
            })
            return
        }

        // clear error tip
        setAddressTip(null)

        if (!address && !registeredAddress) return
        if (!isValidAddress(address) && !isValidAddress(registeredAddress)) return
        methods.clearErrors('address')

        if (isSameAddress(address, wallet?.address) || isSameAddress(registeredAddress, wallet?.address)) {
            setAddressTip({
                type: TransferAddressError.SAME_ACCOUNT,
                message: t('wallet_transfer_error_same_address_with_current_account'),
            })
            return
        }

        const result = await Web3.getCode(address)

        if (result !== '0x') {
            setAddressTip({
                type: TransferAddressError.CONTRACT_ADDRESS,
                message: t('wallet_transfer_error_is_contract_address'),
            })
        }
    }, [address, pluginID, registeredAddress, methods.clearErrors, wallet?.address, resolveDomainError])
    // #endregion

    // #region Get min gas limit with amount and recipient address
    const { value: minGasLimit } = useGasLimit(
        selectedAsset?.schema,
        selectedAsset?.address,
        rightShift(amount ?? 0, selectedAsset?.decimals).toFixed(),
        isValidAddress(address) ? address : registeredAddress,
    )
    // #endregion

    // #region hack for smartPay, will be removed
    const maskTokenAddress = useMaskTokenAddress()
    const { value: ratio } = useAsync(async () => {
        if (!smartPayChainId) return
        const depositPaymaster = new DepositPaymaster(smartPayChainId)
        return depositPaymaster.getRatio()
    }, [smartPayChainId])

    const actualSelected = useMemo(() => {
        if (!selectedAsset) return
        if (isNativeTokenAddress(selectedAsset.address)) {
            return {
                ...selectedAsset,
                balance: toFixed(
                    BigNumber.max(
                        0,
                        minus(
                            selectedAsset?.balance,
                            new BigNumber(formatGweiToWei(maxFeePerGas)).multipliedBy('210000').integerValue(),
                        ),
                    ),
                    0,
                ),
            }
        }
        if (
            !wallet?.owner ||
            chainId !== smartPayChainId ||
            !isSameAddress(selectedAsset?.address, maskTokenAddress) ||
            !ratio
        )
            return selectedAsset

        return {
            ...selectedAsset,
            balance: toFixed(
                minus(
                    selectedAsset?.balance,
                    new BigNumber(formatGweiToWei(maxFeePerGas))
                        .multipliedBy(!isZero(gasLimit) ? addGasMargin(gasLimit) : '200000')
                        .integerValue()
                        .multipliedBy(ratio),
                ),
                0,
            ),
        }
    }, [gasLimit, maxFeePerGas, selectedAsset, maskTokenAddress, smartPayChainId, chainId, wallet?.owner, ratio])
    // #endregion

    const maxAmount = useMemo(() => {
        const gasFee = formatGweiToWei(maxFeePerGas || 0).multipliedBy(minGasLimit ?? MIN_GAS_LIMIT)
        let amount_ = new BigNumber(actualSelected?.balance ?? 0)
        amount_ = actualSelected?.schema === SchemaType.Native ? amount_.minus(gasFee) : amount_
        return formatBalance(BigNumber.max(0, amount_).toFixed(), actualSelected?.decimals)
    }, [actualSelected, maxFeePerGas, minGasLimit])

    // #region set default gasLimit
    useUpdateEffect(() => {
        if (!minGasLimit) return
        methods.setValue('gasLimit', minGasLimit.toString())
        setMinGasLimitContext(minGasLimit)
    }, [minGasLimit, methods.setValue])
    // #endregion

    // #region set default Max priority gas fee and max fee
    useUpdateEffect(() => {
        if (!estimateGasFees) return
        const { normal } = estimateGasFees
        methods.setValue('maxFeePerGas', new BigNumber(normal?.suggestedMaxFeePerGas ?? 0).toString())
        methods.setValue('maxPriorityFeePerGas', new BigNumber(normal?.suggestedMaxPriorityFeePerGas ?? 0).toString())
    }, [estimateGasFees, methods.setValue])
    // #endregion

    const [_, transferCallback] = useTokenTransferCallback(
        selectedAsset?.schema ?? SchemaType.Native,
        selectedAsset?.address ?? '',
    )

    const handleMaxClick = useCallback(() => {
        methods.setValue('amount', maxAmount)
    }, [methods.setValue, maxAmount])

    const [{ loading, error }, onSubmit] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            const transferAmount = rightShift(data.amount || '0', selectedAsset?.decimals).toFixed()

            // If input address is ens domain, use registeredAddress to transfer
            if (isValidDomain(data.address)) {
                await transferCallback(transferAmount, registeredAddress, {
                    maxFeePerGas: toHex(formatGweiToWei(data.maxFeePerGas).toFixed(0)),
                    maxPriorityFeePerGas: toHex(formatGweiToWei(data.maxPriorityFeePerGas).toFixed(0)),
                    gas: data.gasLimit,
                })
                return
            }

            await transferCallback(transferAmount, data.address, {
                maxFeePerGas: toHex(formatGweiToWei(data.maxFeePerGas).toFixed(0)),
                maxPriorityFeePerGas: toHex(formatGweiToWei(data.maxPriorityFeePerGas).toFixed(0)),
                gas: data.gasLimit,
            })
        },
        [selectedAsset, transferCallback, registeredAddress],
    )

    const handleCancel = useCallback(() => {
        const params = new URLSearchParams(location.search)
        const toBeClose = params.get('toBeClose')
        if (toBeClose) {
            Services.Helper.removePopupWindow()
            return
        }
        navigate(-1)
        return
    }, [location])

    const [menu, openMenu] = useMenuConfig(
        [
            <MenuItem className={classes.expand} key="expand">
                <Typography className={classes.title}>{t('wallet_transfer_between_my_accounts')}</Typography>
                <ExpandMore style={{ fontSize: 20 }} />
            </MenuItem>,
            <Collapse key="collapse" in>
                {otherWallets.map((account, index) => (
                    <AccountItem
                        account={account}
                        onClick={() => methods.setValue('address', account.address)}
                        key={index}
                    />
                ))}
            </Collapse>,
        ],
        {
            classes: { paper: classes.menu },
        },
    )

    const popoverContent = useMemo(() => {
        if (resolveDomainLoading) return

        if (addressTip) {
            return (
                <Box py={2.5} px={1.5}>
                    <Typography
                        className={
                            addressTip.type === TransferAddressError.SAME_ACCOUNT
                                ? classes.normalMessage
                                : classes.errorMessage
                        }>
                        {addressTip.message}
                    </Typography>
                </Box>
            )
        }

        if (registeredAddress && !resolveDomainError)
            return (
                <Box display="flex" justifyContent="space-between" alignItems="center" py={2.5} px={1.5}>
                    <Link
                        href={explorerResolver.domainLink(ChainId.Mainnet, address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="none">
                        <Box>
                            <Typography className={classes.domainName}>{address}</Typography>
                            <Typography className={classes.registeredAddress}>
                                <FormattedAddress
                                    address={registeredAddress}
                                    size={4}
                                    formatter={formatEthereumAddress}
                                />
                            </Typography>
                        </Box>
                    </Link>
                    <Icons.Right />
                </Box>
            )

        return
    }, [
        address,
        addressTip,
        registeredAddress,
        methods.formState.errors.address?.type,
        resolveDomainLoading,
        resolveDomainError,
    ])

    return (
        <FormProvider {...methods}>
            <Transfer1559TransferUI
                isAvailableBalance={
                    (!!wallet?.owner &&
                        chainId === smartPayChainId &&
                        isSameAddress(selectedAsset?.address, maskTokenAddress)) ||
                    isNativeTokenAddress(selectedAsset?.address)
                }
                accountName={wallet?.name ?? ''}
                openAccountMenu={openMenu}
                openAssetMenu={openAssetMenu}
                handleMaxClick={handleMaxClick}
                etherPrice={etherPrice ?? 0}
                selectedAsset={actualSelected}
                handleCancel={handleCancel}
                handleConfirm={methods.handleSubmit(onSubmit)}
                confirmLoading={loading}
                popoverContent={popoverContent}
                disableConfirm={!amount || isZero(amount)}
            />
            {otherWallets.length ? menu : null}
        </FormProvider>
    )
})

export interface Transfer1559UIProps {
    accountName: string
    openAccountMenu: (anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => void
    openAssetMenu: (anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => void
    handleMaxClick: () => void
    selectedAsset?: FungibleAsset<ChainId, SchemaType>
    etherPrice: number
    handleCancel: () => void
    handleConfirm: () => void
    confirmLoading: boolean
    popoverContent?: ReactNode
    disableConfirm?: boolean
    isAvailableBalance: boolean
}

type TransferFormData = {
    address: string
    amount: string
    gasLimit: string
    maxPriorityFeePerGas: string
    maxFeePerGas: string
}

export const Transfer1559TransferUI = memo<Transfer1559UIProps>(
    ({
        accountName,
        openAssetMenu,
        openAccountMenu,
        handleMaxClick,
        selectedAsset,
        etherPrice,
        handleCancel,
        handleConfirm,
        confirmLoading,
        popoverContent,
        disableConfirm,
        isAvailableBalance,
    }) => {
        const anchorEl = useRef<HTMLDivElement | null>(null)
        const { t } = useI18N()
        const { classes } = useStyles()
        const [popoverOpen, setPopoverOpen] = useState(false)

        const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT } = useMemo(
            () => ({
                RE_MATCH_FRACTION_AMOUNT: new RegExp(`^\\.\\d{0,${selectedAsset?.decimals}}$`),
                RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${selectedAsset?.decimals}}$`), // d.ddd...d
            }),
            [selectedAsset?.decimals],
        )

        const {
            watch,
            formState: { errors },
        } = useFormContext<TransferFormData>()

        const [maxPriorityFeePerGas, maxFeePerGas, gasLimit] = watch([
            'maxPriorityFeePerGas',
            'maxFeePerGas',
            'gasLimit',
        ])

        useUpdateEffect(() => {
            setPopoverOpen(!!popoverContent && !!anchorEl.current)
        }, [popoverContent])

        return (
            <>
                <div className={classes.container}>
                    <Typography className={classes.label} style={{ marginTop: 0 }}>
                        {t('wallet_transfer_account')}
                    </Typography>
                    <Typography className={classes.accountName}>{accountName}</Typography>
                    <Typography className={classes.label}>{t('wallet_transfer_receiving_account')}</Typography>
                    <Controller
                        render={({ field }) => (
                            <StyledInput
                                {...field}
                                placeholder={t('wallet_transfer_1559_placeholder')}
                                error={!!errors.address?.message}
                                helperText={errors.address?.message}
                                InputProps={{
                                    endAdornment: (
                                        <div onClick={openAccountMenu} style={{ marginLeft: 12 }}>
                                            <Icons.User className={classes.user} />
                                        </div>
                                    ),
                                    onClick: (event) => {
                                        if (!anchorEl.current) anchorEl.current = event.currentTarget
                                        if (popoverContent) setPopoverOpen(true)
                                    },
                                }}
                            />
                        )}
                        name="address"
                    />
                    <Popover
                        open={popoverOpen}
                        classes={{ paper: classes.popover }}
                        anchorEl={anchorEl.current}
                        onClose={() => setPopoverOpen(false)}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}>
                        {popoverContent}
                    </Popover>
                    <Typography className={classes.label}>
                        <span>{t('popups_wallet_choose_token')}</span>
                        <Typography className={classes.balance} component="span">
                            {isAvailableBalance ? t('wallet_available_balance') : t('wallet_balance')}:
                            <FormattedBalance
                                value={selectedAsset?.balance}
                                decimals={selectedAsset?.decimals}
                                symbol={selectedAsset?.symbol}
                                significant={6}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </Typography>
                    <Controller
                        render={({ field }) => {
                            return (
                                <StyledInput
                                    {...field}
                                    type="text"
                                    onChange={(ev) => {
                                        const amount_ = ev.currentTarget.value.replace(/,/g, '.')
                                        if (RE_MATCH_FRACTION_AMOUNT.test(amount_)) {
                                            ev.currentTarget.value = `0${amount_}`
                                            field.onChange(ev)
                                        } else if (amount_ === '' || RE_MATCH_WHOLE_AMOUNT.test(amount_)) {
                                            ev.currentTarget.value = amount_
                                            field.onChange(ev)
                                        }
                                    }}
                                    error={!!errors.amount?.message}
                                    helperText={errors.amount?.message}
                                    InputProps={{
                                        inputProps: {
                                            pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                            min: 0,
                                            minLength: 1,
                                            maxLength: 79,
                                        },
                                        autoComplete: 'off',
                                        autoCorrect: 'off',
                                        title: 'Token Amount',
                                        inputMode: 'decimal',
                                        spellCheck: false,
                                        endAdornment: (
                                            <Box display="flex" alignItems="center">
                                                <Chip
                                                    size="small"
                                                    label="MAX"
                                                    clickable
                                                    color="primary"
                                                    classes={{ root: classes.max, label: classes.maxLabel }}
                                                    onClick={handleMaxClick}
                                                />
                                                {selectedAsset ? (
                                                    <Chip
                                                        className={classes.chip}
                                                        onClick={openAssetMenu}
                                                        icon={
                                                            <TokenIcon
                                                                className={classes.icon}
                                                                address={selectedAsset.address ?? ''}
                                                                name={selectedAsset.name}
                                                                symbol={selectedAsset.symbol}
                                                                logoURL={selectedAsset.logoURL}
                                                            />
                                                        }
                                                        deleteIcon={<ChevronDown className={classes.icon} />}
                                                        color="default"
                                                        size="small"
                                                        variant="outlined"
                                                        clickable
                                                        label={selectedAsset.symbol}
                                                        onDelete={openAssetMenu}
                                                    />
                                                ) : null}
                                            </Box>
                                        ),
                                    }}
                                />
                            )
                        }}
                        name="amount"
                    />
                    <Typography className={classes.label}>{t('gas_limit')}</Typography>
                    <Controller
                        render={({ field }) => (
                            <StyledInput
                                {...field}
                                error={!!errors.gasLimit?.message}
                                helperText={errors.gasLimit?.message}
                                InputProps={{
                                    inputProps: {
                                        pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                    },
                                }}
                            />
                        )}
                        name="gasLimit"
                    />
                    <Typography className={classes.label}>
                        {t('popups_wallet_gas_fee_settings_max_priority_fee')}
                        <Typography component="span" className={classes.unit}>
                            ({t('wallet_transfer_gwei')})
                        </Typography>
                        <Typography component="span" className={classes.price}>
                            <Trans
                                i18nKey="popups_wallet_gas_fee_settings_usd"
                                values={{
                                    usd: formatCurrency(
                                        formatGweiToEther(Number(maxPriorityFeePerGas))
                                            .times(etherPrice)
                                            .times(gasLimit),
                                        'USD',
                                        { onlyRemainTwoDecimal: true },
                                    ),
                                }}
                                components={{ span: <span /> }}
                                shouldUnescape
                            />
                        </Typography>
                    </Typography>
                    <Controller
                        render={({ field }) => (
                            <StyledInput
                                {...field}
                                error={!!errors.maxPriorityFeePerGas?.message}
                                helperText={errors.maxPriorityFeePerGas?.message}
                                InputProps={{
                                    inputProps: {
                                        pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                    },
                                }}
                            />
                        )}
                        name="maxPriorityFeePerGas"
                    />
                    <Typography className={classes.label}>
                        {t('popups_wallet_gas_fee_settings_max_fee')}
                        <Typography component="span" className={classes.unit}>
                            ({t('wallet_transfer_gwei')})
                        </Typography>
                        <Typography component="span" className={classes.price}>
                            <Trans
                                i18nKey="popups_wallet_gas_fee_settings_usd"
                                components={{ span: <span /> }}
                                shouldUnescape
                                values={{
                                    usd: formatCurrency(
                                        formatGweiToEther(Number(maxFeePerGas)).times(etherPrice).times(gasLimit),
                                        'USD',
                                        { onlyRemainTwoDecimal: true },
                                    ),
                                }}
                            />
                        </Typography>
                    </Typography>
                    <Controller
                        render={({ field }) => (
                            <StyledInput
                                {...field}
                                error={!!errors.maxFeePerGas?.message}
                                helperText={errors.maxFeePerGas?.message}
                                InputProps={{
                                    inputProps: {
                                        pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                    },
                                }}
                            />
                        )}
                        name="maxFeePerGas"
                    />
                </div>
                <div className={classes.controller}>
                    <Button
                        variant="contained"
                        className={classes.button}
                        style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}
                        onClick={handleCancel}>
                        {t('cancel')}
                    </Button>
                    <LoadingButton
                        loading={confirmLoading}
                        variant="contained"
                        className={classes.button}
                        disabled={disableConfirm}
                        onClick={handleConfirm}>
                        {t('confirm')}
                    </LoadingButton>
                </div>
            </>
        )
    },
)
