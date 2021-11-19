import { memo, SyntheticEvent, useCallback, useMemo, useState } from 'react'
import { useI18N } from '../../../../../utils'
import { z as zod } from 'zod'
import BigNumber from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import {
    Asset,
    EthereumTokenType,
    formatBalance,
    formatGweiToWei,
    formatWeiToGwei,
    isGreaterThan,
    isZero,
    pow10,
    useChainId,
    useGasLimit,
    useTokenTransferCallback,
    useWallet,
} from '@masknet/web3-shared-evm'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { Box, Button, Chip, Collapse, MenuItem, Typography } from '@mui/material'
import { StyledInput } from '../../../components/StyledInput'
import { UserIcon } from '@masknet/icons'
import { FormattedAddress, FormattedBalance, TokenIcon, useMenu } from '@masknet/shared'
import { ChevronDown } from 'react-feather'
import { noop } from 'lodash-unified'
import { makeStyles } from '@masknet/theme'
import { ExpandMore } from '@mui/icons-material'
import { useHistory } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
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
})

export interface Prior1559TransferProps {
    selectedAsset?: Asset
    otherWallets: { name: string; address: string }[]
    openAssetMenu: (anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => void
}

export const Prior1559Transfer = memo<Prior1559TransferProps>(({ selectedAsset, openAssetMenu, otherWallets }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const wallet = useWallet()
    const chainId = useChainId()
    const [minGasLimitContext, setMinGasLimitContext] = useState(0)
    const history = useHistory()

    const schema = useMemo(() => {
        return zod.object({
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

    //#region Set default gas price
    useAsync(async () => {
        const gasOptions = await WalletRPC.getGasPriceDictFromDeBank(chainId)
        const gasPrice = methods.getValues('gasPrice')
        if (gasOptions && !gasPrice) {
            const gasPrice = new BigNumber(gasOptions.data.fast.price)
            methods.setValue('gasPrice', formatWeiToGwei(gasPrice).toString())
        }
    }, [methods.setValue, methods.getValues, chainId])
    //#endregion

    //#region Get min gas limit with amount and recipient address
    const { value: minGasLimit, error } = useGasLimit(
        selectedAsset?.token.type,
        selectedAsset?.token.address,
        new BigNumber(!!amount ? amount : 0).multipliedBy(pow10(selectedAsset?.token.decimals ?? 0)).toFixed(),
        address,
    )
    //#endregion

    const maxAmount = useMemo(() => {
        let amount_ = new BigNumber(selectedAsset?.balance || '0')
        amount_ =
            selectedAsset?.token.type === EthereumTokenType.Native
                ? amount_.minus(new BigNumber(30000).multipliedBy(gasPrice))
                : amount_

        return amount_.toFixed()
    }, [selectedAsset?.balance, gasPrice, selectedAsset?.token.type])

    //#region set default gasLimit
    useUpdateEffect(() => {
        if (minGasLimit) {
            methods.setValue('gasLimit', `${minGasLimit}`)
            setMinGasLimitContext(minGasLimit)
        }
    }, [minGasLimit, methods.setValue])
    //#endregion

    const [_, transferCallback] = useTokenTransferCallback(
        selectedAsset?.token.type ?? EthereumTokenType.Native,
        selectedAsset?.token.address ?? '',
    )

    const handleMaxClick = useCallback(() => {
        methods.setValue('amount', formatBalance(maxAmount, selectedAsset?.token.decimals))
    }, [methods.setValue, selectedAsset, maxAmount])

    const [{ loading }, onSubmit] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            const transferAmount = new BigNumber(data.amount || '0')
                .multipliedBy(pow10(selectedAsset?.token.decimals || 0))
                .toFixed()
            await transferCallback(transferAmount, data.address, {
                gasPrice: toHex(formatGweiToWei(data.gasPrice).toString()),
                gas: new BigNumber(data.gasLimit).toNumber(),
            })
        },
        [selectedAsset],
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
            <Prior1559TransferUI
                accountName={wallet?.name ?? ''}
                selectedAsset={selectedAsset}
                openAccountMenu={openMenu}
                openAssetMenu={openAssetMenu}
                handleMaxClick={handleMaxClick}
                handleCancel={() => history.goBack()}
                handleConfirm={methods.handleSubmit(onSubmit)}
                confirmLoading={loading}
                maxAmount={maxAmount}
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
    selectedAsset?: Asset
    handleCancel: () => void
    handleConfirm: () => void
    confirmLoading: boolean
    maxAmount: string
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
            formState: { errors },
        } = useFormContext<TransferFormData>()

        return (
            <>
                <form className={classes.container} onSubmit={handleConfirm}>
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
                                value={maxAmount}
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

                    <div className={classes.gasInput}>
                        <div>
                            <Typography className={classes.label}>Gas Price</Typography>
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
                            <Typography className={classes.label}>Gas limit</Typography>
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
                        onClick={handleConfirm}>
                        {t('confirm')}
                    </LoadingButton>
                </div>
            </>
        )
    },
)
