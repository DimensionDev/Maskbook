import { useMenuConfig } from '@masknet/shared'
import { MenuItem, Typography } from '@mui/material'
import { useI18N } from '../../../utils/i18n-next-ui.js'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useChainIdSupport, useGasOptions } from '@masknet/web3-hooks-base'
import { formatWeiToGwei, type GasConfig, type GasOption } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import { GasSettingModal } from '../modals/modals.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { GasOptionType } from '@masknet/web3-shared-base'

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

export function useGasOptionsMenu(gas: string, callback: (config: GasConfig, type?: GasOptionType) => void) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { value: gasOptions } = useGasOptions()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)

    const handleClickCustom = useCallback(async () => {
        const result = await GasSettingModal.openAndWaitForClose({
            chainId,
            config: { gas },
        })
        if (!result) return

        callback(result)
    }, [chainId, gas, callback])

    const handleClick = useCallback(
        (type?: GasOptionType, option?: GasOption) => {
            if (!option) return
            const config = isSupport1559
                ? {
                      maxPriorityFeePerGas: option.suggestedMaxPriorityFeePerGas,
                      maxFeePerGas: option.suggestedMaxFeePerGas,
                  }
                : {
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
                <Typography className={classes.optionName}>{t('popups_wallet_gas_fee_settings_medium')}</Typography>
                <Typography className={classes.optionValue}>
                    {formatWeiToGwei(gasOptions?.slow.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                    <Typography component="span">{t('wallet_transfer_gwei')}</Typography>
                </Typography>
            </MenuItem>,
            <MenuItem
                key="high"
                className={classes.item}
                onClick={() => handleClick(GasOptionType.NORMAL, gasOptions?.normal)}>
                <Typography className={classes.optionName}>{t('popups_wallet_gas_fee_settings_high')}</Typography>
                <Typography className={classes.optionValue}>
                    {formatWeiToGwei(gasOptions?.normal.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                    <Typography component="span">{t('wallet_transfer_gwei')}</Typography>
                </Typography>
            </MenuItem>,
            <MenuItem
                key="instant"
                className={classes.item}
                onClick={() => handleClick(GasOptionType.FAST, gasOptions?.fast)}>
                <Typography className={classes.optionName}>{t('popups_wallet_gas_fee_settings_instant')}</Typography>
                <Typography className={classes.optionValue}>
                    {formatWeiToGwei(gasOptions?.fast.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                    <Typography component="span">{t('wallet_transfer_gwei')}</Typography>
                </Typography>
            </MenuItem>,
            <MenuItem key="custom" className={classes.item} onClick={handleClickCustom}>
                <Typography className={classes.optionName}>{t('popups_wallet_gas_fee_settings_custom')}</Typography>
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
