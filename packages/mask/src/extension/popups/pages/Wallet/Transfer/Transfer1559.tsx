import { memo, SyntheticEvent, useCallback, useMemo, useState } from 'react'
import { useI18N } from '../../../../../utils'
import {
    Asset,
    EthereumTokenType,
    formatBalance,
    formatGweiToEther,
    formatGweiToWei,
    isGreaterThan,
    isZero,
    pow10,
    useChainId,
    useGasLimit,
    useNativeTokenDetailed,
    useTokenTransferCallback,
    useWallet,
} from '@masknet/web3-shared-evm'
import { z as zod } from 'zod'
import { EthereumAddress } from 'wallet.ts'
import BigNumber from 'bignumber.js'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Chip, Collapse, MenuItem, Typography } from '@mui/material'
import { StyledInput } from '../../../components/StyledInput'
import { UserIcon } from '@masknet/icons'
import { FormattedAddress, FormattedBalance, TokenIcon, useMenu } from '@masknet/shared'
import { ChevronDown } from 'react-feather'
import { noop } from 'lodash-unified'
import { ExpandMore } from '@mui/icons-material'
import { useHistory } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { useNativeTokenPrice } from '../../../../../plugins/Wallet/hooks/useTokenPrice'
import { toHex } from 'web3-utils'

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
    menuItem: {
        padding: 8,
        display: 'flex',
        justifyContent: 'space-between',
        '&>*': {
            fontSize: 12,
            lineHeight: '16px',
        },
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
})

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

    const { value: nativeToken } = useNativeTokenDetailed()

    const etherPrice = useNativeTokenPrice(nativeToken?.chainId)

    const { value: estimateGasFees } = useAsync(async () => WalletRPC.getEstimateGasFees(chainId), [chainId])

    const schema = useMemo(() => {
        return zod
            .object({
                address: zod
                    .string()
                    .min(1, t('wallet_transfer_error_address_absence'))
                    .refine((address) => EthereumAddress.isValid(address), t('wallet_transfer_error_invalid_address'))
                    .refine((address) => address !== wallet?.address, t('wallet_transfer_error_address_absence')),
                amount: zod
                    .string()
                    .refine((amount) => {
                        const transferAmount = new BigNumber(amount || '0').multipliedBy(
                            pow10(selectedAsset?.token.decimals ?? 0),
                        )
                        return !!transferAmount || !isZero(transferAmount)
                    }, t('wallet_transfer_error_amount_absence'))
                    .refine((amount) => {
                        const transferAmount = new BigNumber(amount || '0').multipliedBy(
                            pow10(selectedAsset?.token.decimals ?? 0),
                        )
                        return !isGreaterThan(transferAmount, selectedAsset?.balance ?? 0)
                    }, t('wallet_transfer_error_insufficient_balance', { token: selectedAsset?.token.symbol })),
                gasLimit: zod
                    .string()
                    .min(1, t('wallet_transfer_error_gas_limit_absence'))
                    .refine(
                        (gasLimit) => new BigNumber(gasLimit).isGreaterThanOrEqualTo(minGasLimitContext),
                        t('popups_wallet_gas_fee_settings_min_gas_limit_tips', { limit: minGasLimitContext }),
                    ),
                maxPriorityFeePerGas: zod
                    .string()
                    .min(1, t('wallet_transfer_error_max_priority_fee_absence'))
                    .refine(
                        (value) => new BigNumber(value).isPositive(),
                        t('wallet_transfer_error_max_priority_gas_fee_positive'),
                    )
                    .refine((value) => {
                        return new BigNumber(value).isGreaterThanOrEqualTo(
                            estimateGasFees?.low.suggestedMaxPriorityFeePerGas ?? 0,
                        )
                    }, t('wallet_transfer_error_max_priority_gas_fee_too_low'))
                    .refine(
                        (value) =>
                            new BigNumber(value).isLessThan(
                                new BigNumber(estimateGasFees?.high.suggestedMaxPriorityFeePerGas ?? 0).multipliedBy(
                                    HIGH_FEE_WARNING_MULTIPLIER,
                                ),
                            ),
                        t('wallet_transfer_error_max_priority_gas_fee_too_high'),
                    ),
                maxFeePerGas: zod
                    .string()
                    .min(1, t('wallet_transfer_error_max_fee_absence'))
                    .refine(
                        (value) =>
                            new BigNumber(value).isGreaterThanOrEqualTo(
                                estimateGasFees?.low.suggestedMaxFeePerGas ?? 0,
                            ),
                        t('wallet_transfer_error_max_fee_too_low'),
                    )
                    .refine(
                        (value) =>
                            new BigNumber(value).isLessThan(
                                new BigNumber(estimateGasFees?.high.suggestedMaxFeePerGas ?? 0).multipliedBy(
                                    HIGH_FEE_WARNING_MULTIPLIER,
                                ),
                            ),
                        t('wallet_transfer_error_max_fee_too_high'),
                    ),
            })
            .refine((data) => new BigNumber(data.maxPriorityFeePerGas).isLessThanOrEqualTo(data.maxFeePerGas), {
                message: t('wallet_transfer_error_max_priority_gas_fee_imbalance'),
                path: ['maxFeePerGas'],
            })
    }, [selectedAsset, minGasLimitContext, estimateGasFees])

    const methods = useForm<zod.infer<typeof schema>>({
        shouldUnregister: false,
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            address: '',
            amount: '',
            gasLimit: '0',
            maxPriorityFeePerGas: '',
            maxFeePerGas: '',
        },
        context: {
            minGasLimitContext,
            estimateGasFees,
            selectedAsset,
        },
    })

    const [address, amount] = methods.watch(['address', 'amount'])

    //#region Get min gas limit with amount and recipient address
    const { value: minGasLimit } = useGasLimit(
        selectedAsset?.token.type,
        selectedAsset?.token.address,
        new BigNumber(amount ?? 0).multipliedBy(pow10(selectedAsset?.token.decimals ?? 0)).toFixed(),
        address,
    )
    //#endregion

    //#region set default gasLimit
    useUpdateEffect(() => {
        if (minGasLimit) {
            methods.setValue('gasLimit', `${minGasLimit}`)
            setMinGasLimitContext(minGasLimit)
        }
    }, [minGasLimit, methods.setValue])
    //#endregion

    //#region set default Max priority gas fee and max fee
    useUpdateEffect(() => {
        if (estimateGasFees) {
            methods.setValue('maxFeePerGas', new BigNumber(estimateGasFees.medium.suggestedMaxFeePerGas).toString())
            methods.setValue(
                'maxPriorityFeePerGas',
                new BigNumber(estimateGasFees.medium.suggestedMaxPriorityFeePerGas).toString(),
            )
        }
    }, [estimateGasFees, methods.setValue])
    //#endregion

    const [_, transferCallback] = useTokenTransferCallback(
        selectedAsset?.token.type ?? EthereumTokenType.Native,
        selectedAsset?.token.address ?? '',
    )

    const handleMaxClick = useCallback(() => {
        methods.setValue('amount', formatBalance(selectedAsset?.balance, selectedAsset?.token.decimals))
    }, [methods.setValue, selectedAsset])

    const [{ loading }, onSubmit] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            const transferAmount = new BigNumber(data.amount || '0')
                .multipliedBy(pow10(selectedAsset?.token.decimals || 0))
                .toFixed()

            await transferCallback(transferAmount, data.address, {
                maxFeePerGas: toHex(formatGweiToWei(data.maxFeePerGas).toString()),
                maxPriorityFeePerGas: toHex(formatGweiToWei(data.maxPriorityFeePerGas).toString()),
                gas: new BigNumber(data.gasLimit).toNumber(),
            })
        },
        [selectedAsset, transferCallback],
    )

    const [menu, openMenu] = useMenu(
        <MenuItem className={classes.expand} key="expand">
            <Typography className={classes.title}>Transfer between my accounts</Typography>
            <ExpandMore style={{ fontSize: 20 }} />
        </MenuItem>,
        <Collapse in>
            {otherWallets.map((account, index) => (
                <MenuItem
                    key={index}
                    className={classes.menuItem}
                    onClick={() => methods.setValue('address', account.address)}>
                    <Typography>{account.name}</Typography>
                    <Typography>
                        <FormattedAddress address={account.address ?? ''} size={4} />
                    </Typography>
                </MenuItem>
            ))}
        </Collapse>,
    )

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
    }) => {
        const { t } = useI18N()
        const { classes } = useStyles()

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

        return (
            <>
                <div className={classes.container}>
                    <Typography className={classes.label}>Transfer Account</Typography>
                    <Typography className={classes.accountName}>{accountName}</Typography>
                    <Typography className={classes.label}>Receiving Account</Typography>
                    <Controller
                        render={({ field }) => (
                            <StyledInput
                                {...field}
                                error={!!errors.address?.message}
                                helperText={errors.address?.message}
                                InputProps={{
                                    endAdornment: (
                                        <div onClick={openAccountMenu} style={{ marginLeft: 12 }}>
                                            <UserIcon className={classes.user} />
                                        </div>
                                    ),
                                }}
                            />
                        )}
                        name="address"
                    />
                    <Typography className={classes.label}>
                        <span>{t('popups_wallet_choose_token')}</span>
                        <Typography className={classes.balance} component="span">
                            {t('wallet_balance')}:
                            <FormattedBalance
                                value={selectedAsset?.balance}
                                decimals={selectedAsset?.token?.decimals}
                                symbol={selectedAsset?.token?.symbol}
                                significant={6}
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
                    <Typography className={classes.label}>Gas Limit</Typography>
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
