import { memo, useEffect, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../../Wallet/messages'
import { useI18N } from '../../../../utils'
import { Box, TextField, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useChainId } from '@masknet/web3-shared-evm'
import classnames from 'classnames'
import { z as zod } from 'zod'
import BigNumber from 'bignumber.js'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const useStyles = makeStyles()((theme) => ({
    option: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        border: `1px solid ${MaskColorVar.twitterLine}`,
        minHeight: 80,
        minWidth: 80,
        cursor: 'pointer',
    },
    optionTitle: {
        fontSize: 16,
        lineHeight: '22px',
        fontWeight: 500,
    },
    pointer: {
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: MaskColorVar.twitterSecond,
        marginBottom: 8,
    },
    selectedPointer: {
        backgroundColor: theme.palette.primary.main,
    },
    selected: {
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
    },
    label: {
        fontSize: 16,
        lineHeight: '22px',
        fontWeight: 500,
        margin: '10px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    unit: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        flex: 1,
        marginLeft: '0.5em',
    },
    form: {
        marginTop: 32,
    },
    textField: {
        width: '100%',
    },
    textFieldInput: {
        borderRadius: 6,
    },
    input: {
        padding: '11px 9px',
        fontSize: 12,
        borderRadius: 6,
    },
}))

interface Gas1559SettingsProps {}

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export const Gas1559Settings = memo<Gas1559SettingsProps>(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()

    const [selected, setOption] = useState<number | null>(1)

    const { value: gasOptions, loading: getGasOptionsLoading } = useAsync(async () => {
        return WalletRPC.getEstimateGasFees(chainId)
    }, [chainId])

    //region Gas Options
    const options = useMemo(
        () => [
            {
                title: t('plugin_trader_gas_setting_instant'),
                content: gasOptions?.low,
            },
            {
                title: t('plugin_trader_gas_setting_medium'),
                content: gasOptions?.medium,
            },
            {
                title: t('plugin_trader_gas_setting_high'),
                content: gasOptions?.high,
            },
        ],
        [gasOptions],
    )

    const schema = useMemo(() => {
        return zod
            .object({
                maxPriorityFeePerGas: zod
                    .string()
                    .min(1, t('wallet_transfer_error_max_priority_fee_absence'))
                    .refine(
                        (value) => new BigNumber(value).isPositive(),
                        t('wallet_transfer_error_max_priority_fee_absence'),
                    ),
                maxFeePerGas: zod.string().min(1, t('wallet_transfer_error_max_fee_absence')),
            })
            .refine((data) => new BigNumber(data.maxPriorityFeePerGas).isLessThanOrEqualTo(data.maxFeePerGas), {
                message: t('wallet_transfer_error_max_priority_gas_fee_imbalance'),
                path: ['maxFeePerGas'],
            })
    }, [])

    const {
        control,
        handleSubmit,
        setValue,
        setError,
        watch,
        formState: { errors },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            maxPriorityFeePerGas: '',
            maxFeePerGas: '0',
        },
    })

    const [maxPriorityFeePerGas, maxFeePerGas] = watch(['maxPriorityFeePerGas', 'maxFeePerGas'])

    //#region These are additional form rules that need to be prompted for but do not affect the validation of the form
    const maxPriorFeeHelperText = useMemo(() => {
        if (getGasOptionsLoading) return undefined
        if (new BigNumber(maxPriorityFeePerGas).isLessThan(gasOptions?.low?.suggestedMaxPriorityFeePerGas ?? 0))
            return t('wallet_transfer_error_max_priority_gas_fee_too_low')
        if (
            new BigNumber(maxPriorityFeePerGas).isGreaterThan(
                new BigNumber(gasOptions?.high?.suggestedMaxPriorityFeePerGas ?? 0).multipliedBy(
                    HIGH_FEE_WARNING_MULTIPLIER,
                ),
            )
        )
            return t('wallet_transfer_error_max_priority_gas_fee_too_high')
        return undefined
    }, [maxPriorityFeePerGas, gasOptions, getGasOptionsLoading])

    const maxFeeGasHelperText = useMemo(() => {
        if (getGasOptionsLoading) return undefined
        if (new BigNumber(maxFeePerGas).isLessThan(gasOptions?.estimatedBaseFee ?? 0))
            return t('wallet_transfer_error_max_fee_too_low')
        if (
            new BigNumber(maxFeePerGas).isGreaterThan(
                new BigNumber(gasOptions?.high?.suggestedMaxFeePerGas ?? 0).multipliedBy(HIGH_FEE_WARNING_MULTIPLIER),
            )
        )
            return t('wallet_transfer_error_max_fee_too_high')
        return undefined
    }, [maxFeePerGas, gasOptions, getGasOptionsLoading])
    //endregion

    //#region If the selected changed, set the value on the option to the form data
    useEffect(() => {
        if (selected !== null) {
            setValue(
                'maxPriorityFeePerGas',
                new BigNumber(options[selected].content?.suggestedMaxPriorityFeePerGas ?? 0).toString() ?? '',
            )
            setValue(
                'maxFeePerGas',
                new BigNumber(options[selected].content?.suggestedMaxFeePerGas ?? 0).toString() ?? '',
            )
        }
    }, [selected, setValue, options])
    //#endregion

    return (
        <Box>
            <Box display="flex" justifyContent="space-around" alignItems="center">
                {options.map((option, index) => (
                    <Box
                        className={classnames(classes.option, selected === index ? classes.selected : undefined)}
                        key={index}
                        onClick={() => setOption(index)}>
                        <Box
                            className={classnames(
                                classes.pointer,
                                selected === index ? classes.selectedPointer : undefined,
                            )}
                        />
                        <Typography className={classes.optionTitle}>{option.title}</Typography>
                    </Box>
                ))}
            </Box>
            <form className={classes.form}>
                <Typography className={classes.label}>
                    {t('popups_wallet_gas_fee_settings_max_priority_fee')}
                    <Typography component="span" className={classes.unit}>
                        ({t('wallet_transfer_gwei')})
                    </Typography>
                </Typography>
                <Controller
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            className={classes.textField}
                            onChange={(e) => {
                                setOption(null)
                                field.onChange(e)
                            }}
                            error={!!errors.maxPriorityFeePerGas?.message || !!maxPriorFeeHelperText}
                            helperText={errors.maxPriorityFeePerGas?.message || maxPriorFeeHelperText}
                            inputProps={{
                                pattern: '^[0-9]*[.,]?[0-9]*$',
                                className: classes.input,
                                'aria-autocomplete': 'none',
                            }}
                            InputProps={{ disableUnderline: true, classes: { root: classes.textFieldInput } }}
                            FormHelperTextProps={{ style: { marginLeft: 0 } }}
                        />
                    )}
                    name="maxPriorityFeePerGas"
                />
                <Typography className={classes.label}>
                    {t('popups_wallet_gas_fee_settings_max_fee')}
                    <Typography component="span" className={classes.unit}>
                        ({t('wallet_transfer_gwei')})
                    </Typography>
                </Typography>
                <Controller
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            error={!!errors.maxFeePerGas?.message || !!maxFeeGasHelperText}
                            helperText={errors.maxFeePerGas?.message || maxFeeGasHelperText}
                            className={classes.textField}
                            onChange={(e) => {
                                setOption(null)
                                field.onChange(e)
                            }}
                            inputProps={{
                                pattern: '^[0-9]*[.,]?[0-9]*$',
                                className: classes.input,
                                'aria-autocomplete': 'none',
                            }}
                            InputProps={{ disableUnderline: true, classes: { root: classes.textFieldInput } }}
                            FormHelperTextProps={{ style: { marginLeft: 0 } }}
                        />
                    )}
                    name="maxFeePerGas"
                />
            </form>
        </Box>
    )
})
