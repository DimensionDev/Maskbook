import { memo, type ReactElement, type SyntheticEvent, useCallback, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { z as zod } from 'zod'
import { BigNumber } from 'bignumber.js'
import { noop } from 'lodash-es'
import { toHex } from 'web3-utils'
import { EthereumAddress } from 'wallet.ts'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    formatGweiToWei,
    formatEthereumAddress,
    type ChainId,
    SchemaType,
    formatWeiToGwei,
} from '@masknet/web3-shared-evm'
import {
    isZero,
    isGreaterThan,
    isGreaterThanOrEqualTo,
    multipliedBy,
    rightShift,
    isSameAddress,
    formatBalance,
    type FungibleAsset,
    GasOptionType,
} from '@masknet/web3-shared-base'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Chip, Collapse, MenuItem, Popover, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { FormattedAddress, FormattedBalance, TokenIcon, useMenuConfig } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { ExpandMore } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { useChainContext, useFungibleTokenBalance, useWallet, useNetworkContext } from '@masknet/web3-hooks-base'
import { Web3, Hub } from '@masknet/web3-providers'
import { useGasLimit, useTokenTransferCallback } from '@masknet/web3-hooks-evm'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { useI18N } from '../../../../../utils/index.js'
import Services from '../../../../service.js'
import { TransferAddressError } from '../type.js'

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
        lineHeight: '16px',
        color: '#15181B',
    },
    user: {
        color: '#15181B',
        cursor: 'pointer',
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
    gasInput: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
    },
    expand: {
        backgroundColor: '#F7F9FA',
        padding: 10,
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
    menu: {
        left: '16px !important',
        width: '100%',
    },
})

export interface Prior1559TransferProps {
    selectedAsset?: FungibleAsset<ChainId, SchemaType>
    otherWallets: Array<{
        name: string
        address: string
    }>
    openAssetMenu: (anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => void
}

export const Prior1559Transfer = memo<Prior1559TransferProps>(({ selectedAsset, openAssetMenu, otherWallets }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { pluginID } = useNetworkContext()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [minGasLimitContext, setMinGasLimitContext] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()

    const [addressTip, setAddressTip] = useState<{
        type: TransferAddressError
        message: string
    } | null>()

    const schema = useMemo(() => {
        return zod.object({
            address: zod
                .string()
                .min(1, t('wallet_transfer_error_address_absence'))
                .refine(EthereumAddress.isValid, t('wallet_transfer_error_invalid_address')),
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
            gasPrice: zod.string().min(1, t('wallet_transfer_error_gas_price_absence')),
        })
    }, [selectedAsset, minGasLimitContext])

    const methods = useForm<zod.infer<typeof schema>>({
        shouldUnregister: false,
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            address: '',
            amount: '',
            gasPrice: '',
            gasLimit: '0',
        },
        context: {
            minGasLimitContext,
            selectedAsset,
        },
    })

    const [address, amount, gasPrice] = methods.watch(['address', 'amount', 'gasPrice'])

    useAsync(async () => {
        setAddressTip(null)
        if (!address || !EthereumAddress.isValid(address)) return

        methods.clearErrors('address')

        if (address.includes('.eth') && pluginID !== NetworkPluginID.PLUGIN_EVM) {
            setAddressTip({
                type: TransferAddressError.NETWORK_NOT_SUPPORT,
                message: t('wallet_transfer_error_no_support_ens'),
            })
            return
        }

        if (isSameAddress(address, wallet?.address)) {
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
    }, [address, methods.clearErrors, pluginID])

    // #region Set default gas price
    useAsync(async () => {
        const gasOptions = await Hub.getGasOptions(chainId)
        const gasPrice = methods.getValues('gasPrice')
        if (gasOptions && !gasPrice) {
            const gasPrice = formatWeiToGwei(gasOptions[GasOptionType.FAST].suggestedMaxFeePerGas)
            methods.setValue('gasPrice', gasPrice.toString())
        }
    }, [chainId, methods.setValue, methods.getValues])
    // #endregion

    // #region Get min gas limit with amount and recipient address
    const { value: minGasLimit, error } = useGasLimit(
        selectedAsset?.schema,
        selectedAsset?.address,
        rightShift(amount ? amount : 0, selectedAsset?.decimals).toFixed(),
        EthereumAddress.isValid(address) ? address : '',
    )
    // #endregion

    const { value: tokenBalance = '0' } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        selectedAsset?.address ?? '',
    )

    const maxAmount = useMemo(() => {
        let amount_ = new BigNumber(tokenBalance || '0')
        amount_ = selectedAsset?.schema === SchemaType.Native ? amount_.minus(multipliedBy(30000, gasPrice)) : amount_

        return BigNumber.max(0, amount_).toFixed()
    }, [selectedAsset?.balance, gasPrice, selectedAsset?.type, tokenBalance])

    // #region set default gasLimit
    useUpdateEffect(() => {
        if (!minGasLimit) return
        methods.setValue('gasLimit', minGasLimit.toString())
        setMinGasLimitContext(minGasLimit)
    }, [minGasLimit, methods.setValue])
    // #endregion

    const [_, transferCallback] = useTokenTransferCallback(
        selectedAsset?.schema ?? SchemaType.Native,
        selectedAsset?.address ?? '',
    )

    const handleMaxClick = useCallback(() => {
        methods.setValue('amount', formatBalance(maxAmount, selectedAsset?.decimals))
    }, [methods.setValue, selectedAsset, maxAmount])

    const [{ loading }, onSubmit] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            const transferAmount = rightShift(data.amount || '0', selectedAsset?.decimals).toFixed()
            await transferCallback(transferAmount, data.address, {
                gasPrice: toHex(formatGweiToWei(data.gasPrice).toString()),
                gas: data.gasLimit,
            })
        },
        [selectedAsset, transferCallback],
    )

    const [menu, openMenu] = useMenuConfig(
        [
            <MenuItem className={classes.expand} key="expand">
                <Typography className={classes.title}>{t('wallet_transfer_between_my_accounts')}</Typography>
                <ExpandMore style={{ fontSize: 20 }} />
            </MenuItem>,
            <Collapse key="collapse" in>
                {otherWallets.map((account, index) => (
                    <MenuItem
                        key={index}
                        className={classes.menuItem}
                        onClick={() => methods.setValue('address', account.address)}>
                        <Typography>{account.name}</Typography>
                        <Typography>
                            <FormattedAddress
                                address={account.address ?? ''}
                                size={4}
                                formatter={formatEthereumAddress}
                            />
                        </Typography>
                    </MenuItem>
                ))}
            </Collapse>,
        ],
        {
            classes: { paper: classes.menu },
        },
    )
    const popoverContent = useMemo(() => {
        if (!addressTip) return

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
    }, [address, addressTip])

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

    return (
        <FormProvider {...methods}>
            <Prior1559TransferUI
                accountName={wallet?.name ?? ''}
                selectedAsset={selectedAsset}
                openAccountMenu={openMenu}
                openAssetMenu={openAssetMenu}
                handleMaxClick={handleMaxClick}
                handleCancel={handleCancel}
                handleConfirm={methods.handleSubmit(onSubmit)}
                confirmLoading={loading}
                maxAmount={maxAmount}
                popoverContent={popoverContent}
                disableConfirm={!amount || isZero(amount)}
            />
            {otherWallets ? menu : null}
        </FormProvider>
    )
})

export interface Prior1559TransferUIProps {
    accountName: string
    openAccountMenu: (anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => void
    openAssetMenu: (anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => void
    handleMaxClick: () => void
    selectedAsset?: FungibleAsset<ChainId, SchemaType>
    handleCancel: () => void
    handleConfirm: () => void
    confirmLoading: boolean
    maxAmount: string
    popoverContent?: ReactElement
    disableConfirm?: boolean
}

type TransferFormData = {
    address: string
    amount: string
    gasPrice: string
    gasLimit: string
}

export const Prior1559TransferUI = memo<Prior1559TransferUIProps>(
    ({
        accountName,
        openAccountMenu,
        openAssetMenu,
        handleMaxClick,
        selectedAsset,
        handleConfirm,
        handleCancel,
        confirmLoading,
        maxAmount,
        popoverContent,
        disableConfirm,
    }) => {
        const { t } = useI18N()
        const { classes } = useStyles()
        const anchorEl = useRef<HTMLDivElement | null>(null)
        const [popoverOpen, setPopoverOpen] = useState(false)

        const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT } = useMemo(
            () => ({
                RE_MATCH_FRACTION_AMOUNT: new RegExp(`^\\.\\d{0,${selectedAsset?.decimals}}$`),
                RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${selectedAsset?.decimals}}$`), // d.ddd...d
            }),
            [selectedAsset?.decimals],
        )

        const {
            formState: { errors },
        } = useFormContext<TransferFormData>()

        useUpdateEffect(() => {
            setPopoverOpen(!!(popoverContent && anchorEl.current))
        }, [popoverContent])

        return (
            <>
                <form className={classes.container} onSubmit={handleConfirm}>
                    <Typography className={classes.label} style={{ marginTop: 0 }}>
                        {t('wallet_transfer_account')}
                    </Typography>
                    <Typography className={classes.accountName}>{accountName}</Typography>
                    <Typography className={classes.label}>{t('wallet_transfer_receiving_account')}</Typography>
                    <Controller
                        render={({ field }) => (
                            <StyledInput
                                {...field}
                                error={!!errors.address?.message}
                                helperText={errors.address?.message}
                                InputProps={{
                                    endAdornment: (
                                        <div onClick={openAccountMenu} style={{ marginLeft: 12 }}>
                                            <Icons.User size={20} className={classes.user} />
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
                                value={maxAmount}
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
                                                        onDelete={noop}
                                                    />
                                                ) : null}
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

                    <div className={classes.gasInput}>
                        <div>
                            <Typography className={classes.label}>{t('gas_price')}</Typography>
                            <Controller
                                render={({ field }) => (
                                    <StyledInput
                                        {...field}
                                        error={!!errors.gasPrice?.message}
                                        helperText={errors.gasPrice?.message}
                                        inputProps={{
                                            pattern: '^[0-9]*[.,]?[0-9]*$',
                                        }}
                                    />
                                )}
                                name="gasPrice"
                            />
                        </div>
                        <div>
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
                        </div>
                    </div>
                </form>
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
