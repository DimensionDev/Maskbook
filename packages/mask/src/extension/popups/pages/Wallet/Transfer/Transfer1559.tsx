import { memo, ReactElement, SyntheticEvent, useCallback, useMemo, useRef, useState } from 'react'
import { useI18N } from '../../../../../utils'
import {
    Asset,
    EthereumTokenType,
    formatBalance,
    formatEthereumAddress,
    formatGweiToEther,
    formatGweiToWei,
    isSameAddress,
    useChainId,
    useFungibleTokenBalance,
    useGasLimit,
    useNativeTokenDetailed,
    useTokenTransferCallback,
    useWallet,
} from '@masknet/web3-shared-evm'
import {
    isGreaterThan,
    isGreaterThanOrEqualTo,
    isLessThan,
    isLessThanOrEqualTo,
    isPositive,
    isZero,
    multipliedBy,
    rightShift,
} from '@masknet/web3-shared-base'
import { z as zod } from 'zod'
import { EthereumAddress } from 'wallet.ts'
import BigNumber from 'bignumber.js'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Chip, Collapse, Link, MenuItem, Popover, Typography } from '@mui/material'
import { StyledInput } from '../../../components/StyledInput'
import { RightIcon, UserIcon } from '@masknet/icons'
import { FormattedAddress, FormattedBalance, TokenIcon, useMenu } from '@masknet/shared'
import { ChevronDown } from 'react-feather'
import { noop } from 'lodash-unified'
import { ExpandMore } from '@mui/icons-material'
import { useHistory } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { useNativeTokenPrice } from '../../../../../plugins/Wallet/hooks/useTokenPrice'
import { toHex } from 'web3-utils'
import { NetworkPluginID, useLookupAddress, useWeb3State } from '@masknet/plugin-infra'
import { AccountItem } from './AccountItem'
import Services from '../../../../service'
import { TransferAddressError } from '../type'

const useStyles = makeStyles()({
    container: {
        padding: 16,
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
        linHeight: '16px',
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
    gasInput: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
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
        padding: 16,
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
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '20px',
        color: '#000000',
    },
    registeredAddress: {
        color: '#7B8192',
        fontSize: 14,
        lineHeight: '20px',
    },
})
const MIN_GAS_LIMIT = 21000
export interface Transfer1559Props {
    selectedAsset?: Asset
    otherWallets: { name: string; address: string }[]
    openAssetMenu: (anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => void
}

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export const Transfer1559 = memo<Transfer1559Props>(({ selectedAsset, openAssetMenu, otherWallets }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const wallet = useWallet()

    const chainId = useChainId()
    const history = useHistory()

    const [minGasLimitContext, setMinGasLimitContext] = useState(0)
    const [addressTip, setAddressTip] = useState<{ type: TransferAddressError; message: string } | null>()

    const { value: nativeToken } = useNativeTokenDetailed()

    const etherPrice = useNativeTokenPrice(nativeToken?.chainId)

    const { value: estimateGasFees } = useAsync(async () => WalletRPC.getEstimateGasFees(chainId), [chainId])

    const { Utils } = useWeb3State()

    const schema = useMemo(() => {
        return zod
            .object({
                address: zod
                    .string()
                    .min(1, t('wallet_transfer_error_address_absence'))
                    .refine(
                        (address) => EthereumAddress.isValid(address) || Utils?.isValidDomain?.(address),
                        t('wallet_transfer_error_invalid_address'),
                    ),
                amount: zod
                    .string()
                    .refine((amount) => {
                        const transferAmount = rightShift(amount || '0', selectedAsset?.token.decimals)
                        return !!transferAmount || !isZero(transferAmount)
                    }, t('wallet_transfer_error_amount_absence'))
                    .refine((amount) => {
                        const transferAmount = rightShift(amount || '0', selectedAsset?.token.decimals)
                        return !isGreaterThan(transferAmount, selectedAsset?.balance ?? 0)
                    }, t('wallet_transfer_error_insufficient_balance', { token: selectedAsset?.token.symbol })),
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
                        return isGreaterThanOrEqualTo(value, estimateGasFees?.low?.suggestedMaxPriorityFeePerGas ?? 0)
                    }, t('wallet_transfer_error_max_priority_gas_fee_too_low'))
                    .refine(
                        (value) =>
                            isLessThan(
                                value,
                                multipliedBy(
                                    estimateGasFees?.high?.suggestedMaxPriorityFeePerGas ?? 0,
                                    HIGH_FEE_WARNING_MULTIPLIER,
                                ),
                            ),
                        t('wallet_transfer_error_max_priority_gas_fee_too_high'),
                    ),
                maxFeePerGas: zod
                    .string()
                    .min(1, t('wallet_transfer_error_max_fee_absence'))
                    .refine(
                        (value) => isGreaterThanOrEqualTo(value, estimateGasFees?.low?.suggestedMaxFeePerGas ?? 0),
                        t('wallet_transfer_error_max_fee_too_low'),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                value,
                                multipliedBy(
                                    estimateGasFees?.high?.suggestedMaxFeePerGas ?? 0,
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
    }, [wallet, selectedAsset, minGasLimitContext, estimateGasFees, Utils])

    const methods = useForm<zod.infer<typeof schema>>({
        shouldUnregister: false,
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            address: '',
            amount: '',
            gasLimit: selectedAsset?.token.type === EthereumTokenType.Native ? '21000' : '0',
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

    const [address, amount, maxFeePerGas] = methods.watch(['address', 'amount', 'maxFeePerGas'])

    // #region resolve ENS domain
    const {
        value: registeredAddress = '',
        error: resolveDomainError,
        loading: resolveDomainLoading,
    } = useLookupAddress(address, NetworkPluginID.PLUGIN_EVM)

    useUpdateEffect(() => {
        // The input is ens domain but the binding address cannot be found
        if (Utils?.isValidDomain?.(address) && (resolveDomainError || !registeredAddress))
            setAddressTip({
                type: TransferAddressError.RESOLVE_FAILED,
                message: t('wallet_transfer_error_no_address_has_been_set_name'),
            })
    }, [resolveDomainError, registeredAddress, methods.setError, address, Utils])
    // #endregion

    // #region check address or registered address type
    useAsync(async () => {
        setAddressTip(null)
        if (!address && !registeredAddress) return
        if (!EthereumAddress.isValid(address) && !EthereumAddress.isValid(registeredAddress)) return
        methods.clearErrors('address')

        if (isSameAddress(address, wallet?.address) || isSameAddress(registeredAddress, wallet?.address)) {
            setAddressTip({
                type: TransferAddressError.SAME_ACCOUNT,
                message: t('wallet_transfer_error_same_address_with_current_account'),
            })
            return
        }

        const result = await Services.Ethereum.getCode(address)

        if (result !== '0x') {
            setAddressTip({
                type: TransferAddressError.CONTRACT_ADDRESS,
                message: t('wallet_transfer_error_is_contract_address'),
            })
        }
    }, [address, EthereumAddress.isValid, registeredAddress, methods.clearErrors, wallet?.address, registeredAddress])
    // #endregion

    // #region Get min gas limit with amount and recipient address
    const { value: minGasLimit } = useGasLimit(
        selectedAsset?.token.type,
        selectedAsset?.token.address,
        rightShift(amount ?? 0, selectedAsset?.token.decimals).toFixed(),
        EthereumAddress.isValid(address) ? address : registeredAddress,
    )
    // #endregion

    const { value: tokenBalance = '0' } = useFungibleTokenBalance(
        selectedAsset?.token?.type ?? EthereumTokenType.Native,
        selectedAsset?.token?.address ?? '',
    )

    const maxAmount = useMemo(() => {
        const gasFee = formatGweiToWei(maxFeePerGas ?? 0).multipliedBy(MIN_GAS_LIMIT)
        let amount_ = new BigNumber(tokenBalance ?? 0)
        amount_ = selectedAsset?.token.type === EthereumTokenType.Native ? amount_.minus(gasFee) : amount_
        return formatBalance(amount_.toFixed(), selectedAsset?.token.decimals)
    }, [selectedAsset, maxFeePerGas, minGasLimit, tokenBalance])

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
        const { medium } = estimateGasFees
        methods.setValue('maxFeePerGas', new BigNumber(medium?.suggestedMaxFeePerGas ?? 0).toString())
        methods.setValue('maxPriorityFeePerGas', new BigNumber(medium?.suggestedMaxPriorityFeePerGas ?? 0).toString())
    }, [estimateGasFees, methods.setValue])
    // #endregion

    const [_, transferCallback] = useTokenTransferCallback(
        selectedAsset?.token.type ?? EthereumTokenType.Native,
        selectedAsset?.token.address ?? '',
    )

    const handleMaxClick = useCallback(() => {
        methods.setValue('amount', maxAmount)
    }, [methods.setValue, maxAmount])

    const [{ loading }, onSubmit] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            const transferAmount = rightShift(data.amount || '0', selectedAsset?.token.decimals).toFixed()

            // If input address is ens domain, use registeredAddress to transfer
            if (Utils?.isValidDomain?.(data.address)) {
                await transferCallback(transferAmount, registeredAddress, {
                    maxFeePerGas: toHex(formatGweiToWei(data.maxFeePerGas).toString()),
                    maxPriorityFeePerGas: toHex(formatGweiToWei(data.maxPriorityFeePerGas).toString()),
                    gas: new BigNumber(data.gasLimit).toNumber(),
                })
                return
            }

            await transferCallback(transferAmount, data.address, {
                maxFeePerGas: toHex(formatGweiToWei(data.maxFeePerGas).toString()),
                maxPriorityFeePerGas: toHex(formatGweiToWei(data.maxPriorityFeePerGas).toString()),
                gas: new BigNumber(data.gasLimit).toNumber(),
            })
        },
        [selectedAsset, transferCallback, registeredAddress, Utils],
    )

    const [menu, openMenu] = useMenu(
        <MenuItem className={classes.expand} key="expand">
            <Typography className={classes.title}>{t('wallet_transfer_between_my_accounts')}</Typography>
            <ExpandMore style={{ fontSize: 20 }} />
        </MenuItem>,
        <Collapse in>
            {otherWallets.map((account, index) => (
                <AccountItem
                    account={account}
                    onClick={() => methods.setValue('address', account.address)}
                    key={index}
                />
            ))}
        </Collapse>,
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

        if (registeredAddress && !resolveDomainError && Utils?.resolveDomainLink)
            return (
                <Link
                    href={Utils.resolveDomainLink(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none">
                    <Box display="flex" justifyContent="space-between" alignItems="center" py={2.5} px={1.5}>
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
                        <RightIcon />
                    </Box>
                </Link>
            )

        return
    }, [
        address,
        addressTip,
        registeredAddress,
        Utils?.resolveDomainLink,
        methods.formState.errors.address?.type,
        resolveDomainLoading,
        resolveDomainError,
    ])

    return (
        <FormProvider {...methods}>
            <Transfer1559TransferUI
                accountName={wallet?.name ?? ''}
                openAccountMenu={openMenu}
                openAssetMenu={openAssetMenu}
                handleMaxClick={handleMaxClick}
                etherPrice={etherPrice}
                selectedAsset={selectedAsset}
                handleCancel={() => history.goBack()}
                handleConfirm={methods.handleSubmit(onSubmit)}
                confirmLoading={loading}
                popoverContent={popoverContent}
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
    selectedAsset?: Asset
    etherPrice: number
    handleCancel: () => void
    handleConfirm: () => void
    confirmLoading: boolean
    popoverContent?: ReactElement
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
    }) => {
        const anchorEl = useRef<HTMLDivElement | null>(null)
        const { t } = useI18N()
        const { classes } = useStyles()
        const [popoverOpen, setPopoverOpen] = useState(false)

        const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT } = useMemo(
            () => ({
                RE_MATCH_FRACTION_AMOUNT: new RegExp(`^\\.\\d{0,${selectedAsset?.token.decimals}}$`), // .ddd...d
                RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${selectedAsset?.token.decimals}}$`), // d.ddd...d
            }),
            [selectedAsset?.token.decimals],
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
                    <Typography className={classes.label}>{t('wallet_transfer_account')}</Typography>
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
                                            <UserIcon className={classes.user} />
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
                            {t('wallet_balance')}:
                            <FormattedBalance
                                value={selectedAsset?.balance}
                                decimals={selectedAsset?.token?.decimals}
                                symbol={selectedAsset?.token?.symbol}
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
                                                <Chip
                                                    className={classes.chip}
                                                    onClick={openAssetMenu}
                                                    icon={
                                                        <TokenIcon
                                                            classes={{ icon: classes.icon }}
                                                            address={selectedAsset?.token.address ?? ''}
                                                            name={selectedAsset?.token.name}
                                                            logoURI={selectedAsset?.token.logoURI}
                                                        />
                                                    }
                                                    deleteIcon={<ChevronDown className={classes.icon} />}
                                                    color="default"
                                                    size="small"
                                                    variant="outlined"
                                                    clickable
                                                    label={selectedAsset?.token.symbol}
                                                    onDelete={noop}
                                                />
                                            </Box>
                                        ),
                                    }}
                                    inputProps={{
                                        pattern: '^[0-9]*[.,]?[0-9]*$',
                                        min: 0,
                                        minLength: 1,
                                        maxLength: 79,
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
                                inputProps={{
                                    pattern: '^[0-9]*[.,]?[0-9]*$',
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
                            {t('popups_wallet_gas_fee_settings_usd', {
                                usd: formatGweiToEther(Number(maxPriorityFeePerGas) ?? 0)
                                    .times(etherPrice)
                                    .times(gasLimit)
                                    .toPrecision(3),
                            })}
                        </Typography>
                    </Typography>
                    <Controller
                        render={({ field }) => (
                            <StyledInput
                                {...field}
                                error={!!errors.maxPriorityFeePerGas?.message}
                                helperText={errors.maxPriorityFeePerGas?.message}
                                inputProps={{
                                    pattern: '^[0-9]*[.,]?[0-9]*$',
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
                            {t('popups_wallet_gas_fee_settings_usd', {
                                usd: formatGweiToEther(Number(maxFeePerGas) ?? 0)
                                    .times(etherPrice)
                                    .times(gasLimit)
                                    .toPrecision(3),
                            })}
                        </Typography>
                    </Typography>
                    <Controller
                        render={({ field }) => (
                            <StyledInput
                                {...field}
                                error={!!errors.maxFeePerGas?.message}
                                helperText={errors.maxFeePerGas?.message}
                                inputProps={{
                                    pattern: '^[0-9]*[.,]?[0-9]*$',
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
                        onClick={handleConfirm}>
                        {t('confirm')}
                    </LoadingButton>
                </div>
            </>
        )
    },
)
