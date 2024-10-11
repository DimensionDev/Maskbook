import { zodResolver } from '@hookform/resolvers/zod'
import { t, Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { ProgressiveText } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, MaskTextField } from '@masknet/theme'
import { useChainIdSupport } from '@masknet/web3-hooks-base'
import { GasOptionType, isGreaterThan, minus, multipliedBy, plus } from '@masknet/web3-shared-base'
import {
    formatGweiToWei,
    formatWeiToGwei,
    GasEditor,
    type EIP1559GasConfig,
    type GasConfig,
} from '@masknet/web3-shared-evm'
import { Box, Button, Typography } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { isEmpty } from 'lodash-es'
import { memo, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { type z as zod } from 'zod'
import { GasCost } from '../../../components/GasCost.js'
import { Warning } from '../../../components/Warning.js'
import { useGasManagement } from '../../contexts/GasManager.js'
import { useTrade } from '../../contexts/TradeProvider.js'
import { useSchema } from './schema.js'

const useStyles = makeStyles<void, 'active' | 'gasWarning' | 'gasOk'>()((theme, _, refs) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        gap: theme.spacing(1.5),
        padding: theme.spacing(2),
    },
    box: {
        borderRadius: theme.spacing(1.5),
        border: `1px solid ${theme.palette.maskColor.secondaryMain}`,
        transition: 'border 0.2s ease',
        [`&.${refs.active}`]: {
            border: `1px solid ${theme.palette.maskColor.main}`,
        },
    },
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        padding: theme.spacing(1.5),
        cursor: 'pointer',
    },
    active: {},
    boxTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    boxTail: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    estimatedTime: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    gasWarning: {},
    gasOk: {},
    estimatedValue: {
        fontWeight: 400,
        fontSize: 13,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
        [`&.${refs.gasWarning}`]: {
            color: theme.palette.maskColor.warn,
        },
        [`&.${refs.gasOk}`]: {
            color: theme.palette.maskColor.success,
        },
    },
    boxSubtitle: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
        color: theme.palette.maskColor.second,
    },
    gwei: {
        lineHeight: '20px',
    },
    boxMain: {
        marginRight: 'auto',
    },
    boxContent: {
        fontSize: 13,
        fontWeight: 400,
        padding: theme.spacing(1.5),
        color: theme.palette.maskColor.second,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        lineHeight: '18px',
        borderTop: `1px solid ${theme.palette.maskColor.line}`,
    },
    fieldName: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    fieldNote: {
        fontSize: 13,
        fontWeight: 400,
        color: theme.palette.maskColor.second,
        marginLeft: theme.spacing(1.5),
    },
    error: {
        color: theme.palette.maskColor.danger,
        fontSize: 13,
        lineHeight: '18px',
    },
}))

function formatTimeCost(seconds: number | undefined) {
    if (!seconds) return '--'
    if (seconds < 60) return t`${seconds}sec`
    const mins = seconds / 60
    return t`${mins}min`
}

const MIN_BASE_FEE = '0.01'
const gweiToWei = (gwei: BigNumber.Value | undefined) => (gwei ? formatGweiToWei(gwei).toFixed() : undefined)
const weiToGwei = (wei: BigNumber.Value | undefined) => (wei ? formatWeiToGwei(wei).toFixed() : undefined)
export const NetworkFee = memo(function NetworkFee() {
    const { classes, cx, theme } = useStyles()
    const { chainId } = useTrade()
    const navigate = useNavigate()

    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)
    const { gasLimit, gasConfig, setGasConfig, gasOptions, isLoadingGasOptions: isLoading } = useGasManagement()
    const [pendingGasConfig, setPendingGasConfig] = useState<GasConfig>(gasConfig)
    const gasOptionType = pendingGasConfig.gasOptionType
    const isCustom = gasConfig.gasOptionType === GasOptionType.CUSTOM

    const { defaultGasPrice, defaultBaseFee, defaultPriorityFee } = useMemo(() => {
        const defaultGasPrice = gasConfig.gasPrice
        const defaultPriorityFee = isSupport1559 ? (gasConfig as EIP1559GasConfig).maxPriorityFeePerGas : '0'
        const defaultBaseFee = minus((gasConfig as EIP1559GasConfig).maxFeePerGas ?? '0', defaultPriorityFee)
        return {
            defaultGasPrice,
            defaultBaseFee,
            defaultPriorityFee,
        }
    }, [isCustom, isSupport1559, gasConfig])

    const [baseFee = defaultBaseFee, setBaseFee] = useState<string>()
    const [priorityFee = defaultPriorityFee, setPriorityFee] = useState<string>()
    const [gasPrice = defaultGasPrice, setGasPrice] = useState<string>()
    const customFeePrice = useMemo(
        () => (isSupport1559 ? plus(baseFee || '0', priorityFee || '0') : new BigNumber(gasPrice ?? '0')),
        [isSupport1559, baseFee, priorityFee, gasPrice],
    )

    const isTooHigh = isGreaterThan(customFeePrice, multipliedBy(gasOptions?.fast.suggestedMaxFeePerGas ?? '0', 2))

    const customBoxRef = useRef<HTMLDivElement>(null)
    const disabled = (() => {
        if (gasOptionType !== GasOptionType.CUSTOM) return false
        if (isSupport1559) {
            return !baseFee || !priorityFee
        }
        return !pendingGasConfig.gasPrice
    })()

    const { slowTimeCost, normalTimeCost, fastTimeCost, customTimeCost } = useMemo(() => {
        if (!gasOptions) {
            return {
                slowTimeCost: '--',
                normalTimeCost: '--',
                fastTimeCost: '--',
                customTimeCost: '--',
            }
        }
        const { slow, normal, fast } = gasOptions
        const slowTimeCost = formatTimeCost(slow.estimatedSeconds)
        const normalTimeCost = formatTimeCost(normal.estimatedSeconds)
        const fastTimeCost = formatTimeCost(fast.estimatedSeconds)
        const customTimeCost =
            isGreaterThan(customFeePrice, fast.suggestedMaxFeePerGas ?? '0') ? `< ${fastTimeCost}`
            : isGreaterThan(customFeePrice, normal.suggestedMaxFeePerGas ?? '0') ? `< ${normalTimeCost}`
            : isGreaterThan(customFeePrice, slow.suggestedMaxFeePerGas ?? '0') ? `< ${slowTimeCost}`
            : `> ${slowTimeCost}`
        return {
            slowTimeCost,
            normalTimeCost,
            fastTimeCost,
            customTimeCost,
        }
    }, [gasOptions, customFeePrice])

    const schema = useSchema(isSupport1559)

    const {
        control,
        setValue,
        formState: { errors },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        context: {
            gasOptions,
        },
    })

    return (
        <div className={classes.container}>
            <div
                className={cx(
                    classes.box,
                    classes.option,
                    gasOptionType === GasOptionType.SLOW ? classes.active : null,
                )}
                onClick={() => {
                    const config = GasEditor.fromGasOption(chainId, gasOptions?.slow, GasOptionType.SLOW).getGasConfig()
                    setGasConfig(config)
                    setPendingGasConfig(config)
                    navigate(-1)
                }}>
                <Icons.Bike size={30} color={theme.palette.maskColor.danger} />
                <div className={classes.boxMain}>
                    <Typography className={classes.boxTitle} variant="h2">
                        <Trans>Slow</Trans>
                    </Typography>
                    <ProgressiveText loading={isLoading} className={classes.boxSubtitle} variant="h3">
                        {gasOptions?.slow ?
                            `${formatWeiToGwei(gasOptions.slow.suggestedMaxFeePerGas).toFixed(2)} Gwei`
                        :   '--'}
                    </ProgressiveText>
                </div>
                <div className={classes.boxTail}>
                    <ProgressiveText className={classes.estimatedTime}>{slowTimeCost}</ProgressiveText>
                    <GasCost
                        className={classes.estimatedValue}
                        variant="subtitle1"
                        chainId={chainId}
                        gasLimit={gasLimit}
                        gasPrice={gasOptions?.slow.suggestedMaxFeePerGas}
                    />
                </div>
            </div>
            <div
                className={cx(
                    classes.box,
                    classes.option,
                    gasOptionType === GasOptionType.NORMAL ? classes.active : null,
                )}
                onClick={() => {
                    const config = GasEditor.fromGasOption(
                        chainId,
                        gasOptions?.normal,
                        GasOptionType.NORMAL,
                    ).getGasConfig()
                    setGasConfig(config)
                    setPendingGasConfig(config)
                    navigate(-1)
                }}>
                <Icons.Car size={30} color={theme.palette.maskColor.main} />
                <div className={classes.boxMain}>
                    <Typography className={classes.boxTitle} variant="h2">
                        <Trans>Average</Trans>
                    </Typography>
                    <ProgressiveText loading={isLoading} className={classes.boxSubtitle} variant="h3">
                        {gasOptions?.normal ?
                            `${formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas).toFixed(2)} Gwei`
                        :   '--'}
                    </ProgressiveText>
                </div>
                <div className={classes.boxTail}>
                    <ProgressiveText className={classes.estimatedTime}>{normalTimeCost}</ProgressiveText>
                    <GasCost
                        className={classes.estimatedValue}
                        variant="subtitle1"
                        chainId={chainId}
                        gasLimit={gasLimit}
                        gasPrice={gasOptions?.normal.suggestedMaxFeePerGas}
                    />
                </div>
            </div>
            <div
                className={cx(
                    classes.box,
                    classes.option,
                    gasOptionType === GasOptionType.FAST ? classes.active : null,
                )}
                onClick={() => {
                    const config = GasEditor.fromGasOption(chainId, gasOptions?.fast, GasOptionType.FAST).getGasConfig()
                    setGasConfig(config)
                    setPendingGasConfig(config)
                    navigate(-1)
                }}>
                <Icons.Rocket size={30} color={theme.palette.maskColor.success} />
                <div className={classes.boxMain}>
                    <Typography className={classes.boxTitle} variant="h2">
                        <Trans>Fast</Trans>
                    </Typography>
                    <ProgressiveText loading={isLoading} className={classes.boxSubtitle} variant="h3">
                        {gasOptions?.fast ?
                            `${formatWeiToGwei(gasOptions.fast.suggestedMaxFeePerGas).toFixed(2)} Gwei`
                        :   '--'}
                    </ProgressiveText>
                </div>
                <div className={classes.boxTail}>
                    <ProgressiveText className={classes.estimatedTime}>{fastTimeCost}</ProgressiveText>
                    <GasCost
                        className={classes.estimatedValue}
                        variant="subtitle1"
                        chainId={chainId}
                        gasLimit={gasLimit}
                        gasPrice={gasOptions?.fast.suggestedMaxFeePerGas}
                    />
                </div>
            </div>
            <div
                className={cx(classes.box, gasOptionType === GasOptionType.CUSTOM ? classes.active : null)}
                ref={customBoxRef}>
                <div
                    className={classes.option}
                    onClick={async () => {
                        const config = GasEditor.fromGasOption(
                            chainId,
                            gasOptions?.custom,
                            GasOptionType.CUSTOM,
                        ).getGasConfig()
                        setPendingGasConfig(config)
                        await Promise.resolve()
                        customBoxRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        })
                    }}>
                    <Icons.Gear size={30} />
                    <div className={classes.boxMain}>
                        <Typography className={classes.boxTitle} variant="h2">
                            <Trans>Custom</Trans>
                        </Typography>
                        <Typography className={classes.boxSubtitle} variant="h3">
                            {customFeePrice ? formatWeiToGwei(customFeePrice).toFixed() : '--'} Gwei
                        </Typography>
                    </div>
                    <div className={classes.boxTail}>
                        <Typography className={classes.estimatedTime}>{customTimeCost}</Typography>
                        <GasCost
                            className={cx(classes.estimatedValue, isTooHigh ? classes.gasWarning : classes.gasOk)}
                            variant="subtitle1"
                            chainId={chainId}
                            gasLimit={gasLimit}
                            gasPrice={gasPrice}
                        />
                    </div>
                </div>
                {gasOptionType === GasOptionType.CUSTOM ?
                    <div className={classes.boxContent}>
                        {isSupport1559 ?
                            <>
                                <Box display="flex" alignItems="center">
                                    <Typography className={classes.fieldName}>
                                        <Trans>Max base fee</Trans>
                                    </Typography>
                                    <Typography className={classes.fieldNote}>
                                        <Trans>Base fee required: {MIN_BASE_FEE} Gwei</Trans>
                                    </Typography>
                                </Box>
                                <Controller
                                    control={control}
                                    name="baseFee"
                                    render={({ field, fieldState }) => {
                                        return (
                                            <>
                                                <MaskTextField
                                                    {...field}
                                                    placeholder="0.1-50"
                                                    type="number"
                                                    value={weiToGwei(baseFee)}
                                                    onChange={(e) => {
                                                        const value = gweiToWei(e.target.value) || ''
                                                        setBaseFee(value)
                                                        setValue('baseFee', value)
                                                        field.onChange(e)
                                                    }}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <Typography className={classes.gwei}>Gwei</Typography>
                                                        ),
                                                    }}
                                                />
                                                {fieldState.error ?
                                                    <Typography className={classes.error}>
                                                        {fieldState.error.message}
                                                    </Typography>
                                                :   null}
                                            </>
                                        )
                                    }}
                                />
                                <Typography className={classes.fieldName}>
                                    <Trans>Priority fee</Trans>
                                </Typography>

                                <Controller
                                    control={control}
                                    name="priorityFee"
                                    render={({ field, fieldState }) => {
                                        return (
                                            <>
                                                <MaskTextField
                                                    {...field}
                                                    placeholder="0.1-50"
                                                    type="number"
                                                    value={weiToGwei(priorityFee)}
                                                    onChange={(e) => {
                                                        const value = gweiToWei(e.target.value) || ''
                                                        setPriorityFee(value)
                                                        setValue('priorityFee', value)
                                                        field.onChange(e)
                                                    }}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <Typography className={classes.gwei}>Gwei</Typography>
                                                        ),
                                                    }}
                                                />
                                                {fieldState.error ?
                                                    <Typography className={classes.error}>
                                                        {fieldState.error.message}
                                                    </Typography>
                                                :   null}
                                            </>
                                        )
                                    }}
                                />
                            </>
                        :   <>
                                <Box display="flex" alignItems="center">
                                    <Typography className={classes.fieldName}>
                                        <Trans>Gas Price</Trans>
                                    </Typography>
                                </Box>
                                <Controller
                                    control={control}
                                    name="gasPrice"
                                    render={({ field, fieldState }) => {
                                        return (
                                            <>
                                                <MaskTextField
                                                    {...field}
                                                    placeholder="0.1-50"
                                                    type="number"
                                                    value={weiToGwei(gasPrice)}
                                                    onChange={(e) => {
                                                        const value = gweiToWei(e.target.value) || ''
                                                        setGasPrice(value)
                                                        setValue('gasPrice', value)
                                                        field.onChange(e)
                                                    }}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <Typography className={classes.gwei}>Gwei</Typography>
                                                        ),
                                                    }}
                                                />
                                                {fieldState.error ?
                                                    <Typography className={classes.error}>
                                                        {fieldState.error.message}
                                                    </Typography>
                                                :   null}
                                            </>
                                        )
                                    }}
                                />
                            </>
                        }
                        <Typography>
                            <Trans>Gas Limit</Trans>
                        </Typography>
                        <MaskTextField placeholder="25000" type="number" disabled value={gasLimit} />
                        {isTooHigh ?
                            <Warning
                                description={t`The custom amount entered may be higher than the required network fee.`}
                            />
                        :   null}
                        <Button
                            variant="roundedContained"
                            fullWidth
                            disabled={disabled || !isEmpty(errors)}
                            onClick={() => {
                                if (isSupport1559) {
                                    const maxFeePerGas = plus(baseFee ?? '0', priorityFee ?? '0').toFixed()
                                    setGasConfig({
                                        gas: gasLimit!,
                                        maxFeePerGas,
                                        gasPrice: maxFeePerGas,
                                        maxPriorityFeePerGas: priorityFee,
                                        gasOptionType: GasOptionType.CUSTOM,
                                    })
                                } else {
                                    setGasConfig({
                                        gas: gasLimit!,
                                        gasPrice: gasPrice ?? '0',
                                        gasOptionType: GasOptionType.CUSTOM,
                                    })
                                }
                                navigate(-1)
                            }}>
                            <Trans>Confirm</Trans>
                        </Button>
                    </div>
                :   null}
            </div>
        </div>
    )
})
