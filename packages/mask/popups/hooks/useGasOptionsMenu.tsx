import { useMenuConfig } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useChainIdSupport, useGasOptions } from '@masknet/web3-hooks-base'
import { GasOptionType } from '@masknet/web3-shared-base'
import { formatWeiToGwei, type GasConfig, type GasOption } from '@masknet/web3-shared-evm'
import { MenuItem, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { GasSettingModal } from '../modals/modal-controls.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    paper: {
        borderRadius: 16,
        boxShadow: theme.palette.maskColor.bottomBg,
    },
    list: {
        padding: theme.spacing(0.5, 0),
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.maskColor.line}`,
        minHeight: 38,
        '& > p:first-of-type': {
            marginRight: 12,
        },
        '&:last-of-type': {
            border: 'unset',
        },
    },
    optionName: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    optionValue: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.third,
    },
}))

export function useGasOptionsMenu(
    gasLimit: string | undefined,
    callback: (config: GasConfig, type: GasOptionType) => void,
    paymentToken?: string,
) {
    const { classes } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: gasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM, { chainId })

    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)

    const [customGasConfig, setCustomGasConfig] = useState<GasConfig>()

    const handleClickCustom = useCallback(async () => {
        const result = await GasSettingModal.openAndWaitForClose({
            chainId,
            config: { gasLimit, paymentToken, ...customGasConfig },
        })
        if (!result) return

        if ('maxFeePerGas' in result) {
            setCustomGasConfig({
                ...result,
                gasPrice: result.gasPrice ? formatWeiToGwei(result.gasPrice).toFixed(2) : undefined,
                maxFeePerGas: result.maxFeePerGas ? formatWeiToGwei(result.maxFeePerGas).toFixed(2) : '',
                maxPriorityFeePerGas:
                    result.maxPriorityFeePerGas ? formatWeiToGwei(result.maxPriorityFeePerGas).toFixed(2) : '',
                gasOptionType: GasOptionType.CUSTOM,
            })
        } else {
            setCustomGasConfig({
                ...result,
                gasPrice: formatWeiToGwei(result.gasPrice).toFixed(2),
                gasOptionType: GasOptionType.CUSTOM,
            })
        }
        callback(result, GasOptionType.CUSTOM)
    }, [chainId, gasLimit, callback, customGasConfig, paymentToken])

    const handleClick = useCallback(
        (type: GasOptionType, option: GasOption | undefined) => {
            if (!option) return
            const config: GasConfig =
                isSupport1559 ?
                    {
                        gasOptionType: type,
                        maxPriorityFeePerGas: option.suggestedMaxPriorityFeePerGas,
                        maxFeePerGas: option.suggestedMaxFeePerGas,
                    }
                :   {
                        gasOptionType: type,
                        gasPrice: option.suggestedMaxFeePerGas,
                    }

            callback(config, type)
        },
        [callback, isSupport1559],
    )

    return useMenuConfig(
        [
            <MenuItem
                key="medium"
                className={classes.item}
                onClick={() => handleClick(GasOptionType.SLOW, gasOptions?.slow)}>
                <Typography className={classes.optionName}>
                    <Trans>Medium</Trans>
                </Typography>
                <Typography className={classes.optionValue}>
                    {formatWeiToGwei(gasOptions?.slow.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                    <Typography component="span">
                        <Trans>GWEI</Trans>
                    </Typography>
                </Typography>
            </MenuItem>,
            <MenuItem
                key="high"
                className={classes.item}
                onClick={() => handleClick(GasOptionType.NORMAL, gasOptions?.normal)}>
                <Typography className={classes.optionName}>
                    <Trans>High</Trans>
                </Typography>
                <Typography className={classes.optionValue}>
                    {formatWeiToGwei(gasOptions?.normal.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                    <Typography component="span">
                        <Trans>GWEI</Trans>
                    </Typography>
                </Typography>
            </MenuItem>,
            <MenuItem
                key="instant"
                className={classes.item}
                onClick={() => handleClick(GasOptionType.FAST, gasOptions?.fast)}>
                <Typography className={classes.optionName}>
                    <Trans>Instant</Trans>
                </Typography>
                <Typography className={classes.optionValue}>
                    {formatWeiToGwei(gasOptions?.fast.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                    <Typography component="span">
                        <Trans>GWEI</Trans>
                    </Typography>
                </Typography>
            </MenuItem>,
            <MenuItem key="custom" className={classes.item} onClick={handleClickCustom}>
                <Typography className={classes.optionName}>
                    <Trans>Custom</Trans>
                </Typography>
            </MenuItem>,
        ],
        {
            classes: {
                paper: classes.paper,
                list: classes.list,
            },
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
            },
        },
    )
}
