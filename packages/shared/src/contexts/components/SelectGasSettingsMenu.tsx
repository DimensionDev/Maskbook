import type { MenuProps } from '@mui/material'
import { useSharedI18N } from '@masknet/shared'
import { MenuItem, Typography } from '@mui/material'
import { ShadowRootMenu, makeStyles } from '@masknet/theme'
import type { NetworkPluginID, GasOptionType } from '@masknet/web3-shared-base'
import { formatEtherToGwei, Transaction, formatGweiToWei } from '@masknet/web3-shared-evm'
import { useChainId, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SettingsContext } from '../../UI/components/SettingsBoard/Context.js'
import { omit } from 'lodash-unified'
import BigNumber from 'bignumber.js'

const useStyles = makeStyles()((theme) => {
    return {
        text: {
            fontSize: 14,
            lineHeight: '18px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            marginRight: 5,
        },
        menuItem: {
            display: 'flex',
            justifyContent: 'space-between',
            margin: '0px 12px',
            padding: theme.spacing(1, 0),
            width: 158,
            '&:hover': {
                background: 'none',
            },
        },
        title: {
            fontWeight: 700,
        },
        estimateGas: {
            color: theme.palette.text.third,
        },
        menuItemBorder: {
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
    }
})

export interface SelectGasSettingsMenuResult {
    isCustomGas: boolean
    type: GasOptionType
    transaction: Transaction
}

export interface SelectGasSettingsMenuProps<T extends NetworkPluginID = NetworkPluginID>
    extends Omit<MenuProps, 'onSubmit'> {
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    anchorEl?: HTMLElement
    anchorSibling: boolean
    onSubmit?(settings: SelectGasSettingsMenuResult): void
    openCustomGasSettingsDialog?(): void
}

export function SelectGasSettingsMenu(props: SelectGasSettingsMenuProps) {
    const pluginID = useCurrentWeb3NetworkPluginID(props.pluginID)
    const chainId = useChainId(pluginID, props.chainId)

    return (
        <SettingsContext.Provider initialState={{ pluginID, chainId }}>
            <SelectGasSettingsMenuUI {...props} />
        </SettingsContext.Provider>
    )
}

export function SelectGasSettingsMenuUI(props: SelectGasSettingsMenuProps) {
    const { gasOptions, GAS_OPTION_NAMES } = SettingsContext.useContainer()
    const { classes, cx } = useStyles()
    const t = useSharedI18N()

    return (
        <ShadowRootMenu {...omit(props, ['onSubmit', 'openCustomGasSettingsDialog', 'anchorSibling'])}>
            {Object.entries(gasOptions ?? {})
                .reverse()
                .map(([type, option]) => (
                    <MenuItem
                        key={type}
                        className={cx(classes.menuItem, classes.menuItemBorder)}
                        onClick={() => {
                            const currentGasOption = gasOptions?.[type as GasOptionType]
                            if (!currentGasOption) return
                            props.onSubmit?.({
                                isCustomGas: false,
                                type: type as GasOptionType,
                                transaction: {
                                    maxFeePerGas: formatGweiToWei(currentGasOption.suggestedMaxFeePerGas).toString(),
                                    maxPriorityFeePerGas: formatGweiToWei(
                                        currentGasOption.suggestedMaxPriorityFeePerGas,
                                    ).toString(),
                                    gasPrice: currentGasOption.suggestedMaxPriorityFeePerGas,
                                },
                            })
                        }}>
                        <Typography className={classes.title}>{GAS_OPTION_NAMES[type as GasOptionType]}</Typography>
                        <Typography className={classes.estimateGas}>
                            {new BigNumber(option.suggestedMaxFeePerGas).gt(0)
                                ? `${new BigNumber(option.suggestedMaxFeePerGas).toFixed(2)}Gwei`
                                : new BigNumber(option.estimatedBaseFee ?? 0).gt(0)
                                ? `${formatEtherToGwei(option.estimatedBaseFee!).toFixed(2)}Gwei`
                                : ''}
                        </Typography>
                    </MenuItem>
                ))
                .concat(
                    <MenuItem key="setting" className={classes.menuItem} onClick={props?.openCustomGasSettingsDialog}>
                        <Typography className={classes.title}>{t.gas_settings_custom()}</Typography>
                    </MenuItem>,
                )}
        </ShadowRootMenu>
    )
}
