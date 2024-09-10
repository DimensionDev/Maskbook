import { t, Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { ProgressiveText } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, MaskTextField } from '@masknet/theme'
import { useChainIdSupport } from '@masknet/web3-hooks-base'
import { GasOptionType } from '@masknet/web3-shared-base'
import { formatWeiToGwei, GasEditor, type EIP1559GasConfig, type GasConfig } from '@masknet/web3-shared-evm'
import { Box, Button, Typography } from '@mui/material'
import { memo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GasCost } from '../../components/GasCost.js'
import { Warning } from '../../components/Warning.js'
import { useGasManagement, useSwap } from '../contexts/index.js'

const useStyles = makeStyles<void, 'active'>()((theme, _, refs) => ({
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
        cursor: 'pointer',
        [`&.${refs.active}`]: {
            border: `1px solid ${theme.palette.maskColor.main}`,
        },
    },
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        padding: theme.spacing(1.5),
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
    estimatedValue: {
        fontWeight: 400,
        fontSize: 13,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
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
}))

export const NetworkFee = memo(function NetworkFee() {
    const { classes, cx, theme } = useStyles()
    const { chainId } = useSwap()
    const navigate = useNavigate()

    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)
    const { gas, gasConfig, setGasConfig, gasOptions, isLoadingGasOptions: isLoading } = useGasManagement()
    const [pendingGasConfig, setPendingGasConfig] = useState<GasConfig>(gasConfig)
    const gasOptionType = pendingGasConfig.gasOptionType

    const customBoxRef = useRef<HTMLDivElement>(null)
    const disabled = (() => {
        if (gasOptionType !== GasOptionType.CUSTOM) return false
        if (isSupport1559) {
            const { maxPriorityFeePerGas, gasPrice } = pendingGasConfig as EIP1559GasConfig
            return !maxPriorityFeePerGas || !gasPrice
        }
        return !pendingGasConfig.gasPrice
    })()
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
                            `${formatWeiToGwei(gasOptions.slow.suggestedMaxFeePerGas).toFixed(2)}Gwei`
                        :   '--'}
                    </ProgressiveText>
                </div>
                <div className={classes.boxTail}>
                    <ProgressiveText className={classes.estimatedTime}>
                        {gasOptions?.slow ? `${gasOptions.slow.estimatedSeconds}sec` : '--'}
                    </ProgressiveText>
                    <GasCost
                        className={classes.estimatedValue}
                        variant="subtitle1"
                        gasLimit={gas}
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
                            `${formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas).toFixed(2)}Gwei`
                        :   '--'}
                    </ProgressiveText>
                </div>
                <div className={classes.boxTail}>
                    <ProgressiveText className={classes.estimatedTime}>
                        {gasOptions?.normal ? `${gasOptions.normal.estimatedSeconds}sec` : '--'}
                    </ProgressiveText>
                    <GasCost
                        className={classes.estimatedValue}
                        variant="subtitle1"
                        gasLimit={gas}
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
                            `${formatWeiToGwei(gasOptions.fast.suggestedMaxFeePerGas).toFixed(2)}Gwei`
                        :   '--'}
                    </ProgressiveText>
                </div>
                <div className={classes.boxTail}>
                    <ProgressiveText className={classes.estimatedTime}>
                        {gasOptions?.fast ? `${gasOptions.fast.estimatedSeconds}sec` : '--'}
                    </ProgressiveText>
                    <GasCost
                        className={classes.estimatedValue}
                        variant="subtitle1"
                        gasLimit={gas}
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
                            gasOptions?.fast,
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
                            Custom
                        </Typography>
                        <Typography className={classes.boxSubtitle} variant="h3">
                            30.01Gwei
                        </Typography>
                    </div>
                    <div className={classes.boxTail}>
                        <Typography className={classes.estimatedTime}>1</Typography>
                        <Typography className={classes.estimatedValue} variant="subtitle1">
                            0.0064603 MATIC≈ $0.004434
                        </Typography>
                    </div>
                </div>
                {gasOptionType === GasOptionType.CUSTOM ?
                    <div className={classes.boxContent}>
                        {isSupport1559 ?
                            <>
                                <Box display="flex" alignItems="center">
                                    <Typography>
                                        <Trans>Max base fee</Trans>
                                    </Typography>
                                    <Typography>
                                        <Trans>Base fee required: 0.01 Gwei</Trans>
                                    </Typography>
                                </Box>
                                <MaskTextField
                                    placeholder="0.1-50"
                                    type="number"
                                    onChange={(e) => {
                                        setPendingGasConfig((config) => ({
                                            ...config,
                                            baseFeePerGas: e.target.value,
                                        }))
                                    }}
                                    InputProps={{
                                        endAdornment: <Typography className={classes.gwei}>Gwei</Typography>,
                                    }}
                                />
                                <Typography>
                                    <Trans>Priority fee</Trans>
                                </Typography>
                                <MaskTextField
                                    placeholder="0.1-50"
                                    type="number"
                                    onChange={(e) => {
                                        setPendingGasConfig((config) => ({
                                            ...config,
                                            maxFeePerGas: e.target.value,
                                        }))
                                    }}
                                    InputProps={{
                                        endAdornment: <Typography className={classes.gwei}>Gwei</Typography>,
                                    }}
                                />
                            </>
                        :   <>
                                <Box display="flex" alignItems="center">
                                    <Typography>
                                        <Trans>Max base fee</Trans>
                                    </Typography>
                                    <Typography>
                                        <Trans>Base fee required: 0.01 Gwei</Trans>
                                    </Typography>
                                </Box>
                                <MaskTextField
                                    placeholder="0.1-50"
                                    type="number"
                                    value={pendingGasConfig.gasPrice}
                                    onChange={(e) => {
                                        setPendingGasConfig((config) => ({
                                            ...config,
                                            gasPrice: e.target.value,
                                        }))
                                    }}
                                    InputProps={{
                                        endAdornment: <Typography className={classes.gwei}>Gwei</Typography>,
                                    }}
                                />
                            </>
                        }
                        <Typography>
                            <Trans>Gas Limit</Trans>
                        </Typography>
                        <MaskTextField placeholder="0.1-50" type="number" disabled value={gas} />
                        <Warning
                            description={t`The custom amount entered may be higher than the required network fee.`}
                        />
                        <Button
                            variant="roundedContained"
                            fullWidth
                            disabled={disabled}
                            onClick={() => {
                                setGasConfig(pendingGasConfig)
                            }}>
                            <Trans>Confirm</Trans>
                        </Button>
                    </div>
                :   null}
            </div>
        </div>
    )
})
