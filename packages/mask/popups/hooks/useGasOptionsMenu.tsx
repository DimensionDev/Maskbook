import { useMenuConfig } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useChainIdSupport, useGasOptions } from '@masknet/web3-hooks-base'
import { GasOptionType } from '@masknet/web3-shared-base'
import { formatWeiToGwei, type EIP1559GasConfig, type GasConfig, type GasOption } from '@masknet/web3-shared-evm'
import { MenuItem, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { useMaskSharedTrans } from '../../shared-ui/index.js'
import { GasSettingModal } from '../modals/modals.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        borderRadius: 16,
        boxShadow: theme.palette.maskColor.bottomBg,
    },
    list: {
        padding: theme.spacing(1.5),
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing(1, 0),
        borderBottom: `1px solid ${theme.palette.maskColor.line}`,
        minHeight: 'unset',
        minWidth: 134,
        cursor: 'pointer',
        '&:first-of-type': {
            paddingTop: 0,
        },
        '&:last-of-type': {
            paddingBottom: 4,
            border: 'unset',
        },
        '&.Mui-focusVisible': {
            backgroundColor: 'transparent',
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
    minimumGas: string,
    callback: (config: GasConfig, type?: GasOptionType) => void,
    paymentToken?: string,
) {
    const t = useMaskSharedTrans()
    const { classes } = useStyles()
    const { data: gasOptions } = useGasOptions()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)

    const [customGasConfig, setCustomGasConfig] = useState<GasConfig>()

    const handleClickCustom = useCallback(async () => {
        const result = await GasSettingModal.openAndWaitForClose({
            chainId,
            config: { gas: minimumGas, paymentToken, ...customGasConfig },
        })
        if (!result) return

        setCustomGasConfig({
            ...result,
            gasPrice: result.gasPrice ? formatWeiToGwei(result.gasPrice).toFixed(2) : undefined,
            maxFeePerGas:
                (result as EIP1559GasConfig).maxFeePerGas ?
                    formatWeiToGwei((result as EIP1559GasConfig).maxFeePerGas).toFixed(2)
                :   '',
            maxPriorityFeePerGas:
                (result as EIP1559GasConfig).maxPriorityFeePerGas ?
                    formatWeiToGwei((result as EIP1559GasConfig).maxPriorityFeePerGas).toFixed(2)
                :   '',
        })
        callback(result)
    }, [chainId, minimumGas, callback, customGasConfig, paymentToken])

    const handleClick = useCallback(
        (type?: GasOptionType, option?: GasOption) => {
            if (!option) return
            const config =
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
                <Typography className={classes.optionName}>{t.popups_wallet_gas_fee_settings_medium()}</Typography>
                <Typography className={classes.optionValue}>
                    {formatWeiToGwei(gasOptions?.slow.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                    <Typography component="span">{t.wallet_transfer_gwei()}</Typography>
                </Typography>
            </MenuItem>,
            <MenuItem
                key="high"
                className={classes.item}
                onClick={() => handleClick(GasOptionType.NORMAL, gasOptions?.normal)}>
                <Typography className={classes.optionName}>{t.popups_wallet_gas_fee_settings_high()}</Typography>
                <Typography className={classes.optionValue}>
                    {formatWeiToGwei(gasOptions?.normal.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                    <Typography component="span">{t.wallet_transfer_gwei()}</Typography>
                </Typography>
            </MenuItem>,
            <MenuItem
                key="instant"
                className={classes.item}
                onClick={() => handleClick(GasOptionType.FAST, gasOptions?.fast)}>
                <Typography className={classes.optionName}>{t.popups_wallet_gas_fee_settings_instant()}</Typography>
                <Typography className={classes.optionValue}>
                    {formatWeiToGwei(gasOptions?.fast.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                    <Typography component="span">{t.wallet_transfer_gwei()}</Typography>
                </Typography>
            </MenuItem>,
            <MenuItem key="custom" className={classes.item} onClick={handleClickCustom}>
                <Typography className={classes.optionName}>{t.popups_wallet_gas_fee_settings_custom()}</Typography>
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
