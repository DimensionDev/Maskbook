import { useState } from 'react'
import BigNumber from 'bignumber.js'
import { makeStyles, MaskAlert, MaskColorVar, MaskTabList, MaskTextField } from '@masknet/theme'
import { useSharedI18N } from '@masknet/shared'
import { TabContext } from '@mui/lab'
import { Grid, Tab, Typography } from '@mui/material'
import { InfoIcon, WarningIcon } from '@masknet/icons'
import { GasOptionSelector } from './GasOptionSelector'
import { Section } from './Section'
import { SettingsContext } from './Context'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainIdSupport } from '@masknet/plugin-infra/src/web3'
import { chainResolver } from '@masknet/web3-shared-evm'

enum GasSettingsType {
    Basic = 'Basic',
    Advanced = 'Advanced',
}

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
        paper: {
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(16px)',
        },
        tabs: {
            overflow: 'visible',
        },
        additions: {
            fontWeight: 700,
        },
        label: {
            color: MaskColorVar.textSecondary,
            fontWeight: 700,
        },
        price: {
            fontWeight: 700,
        },
        caption: {
            color: MaskColorVar.textSecondary,
            fontWeight: 700,
            margin: theme.spacing(1, 0, 1.5),
        },
        unit: {
            color: MaskColorVar.textLight,
        },
        textfield: {
            '& input[type=number]': {
                '-moz-appearance': 'textfield',
            },
            '& input[type=number]::-webkit-outer-spin-button': {
                '-webkit-appearance': 'none',
            },
            '& input[type=number]::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
            },
        },
    }
})

export interface GasSectionProps {}

export function GasSection(props: GasSectionProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()
    const [activeTab, setActiveTab] = useState(GasSettingsType.Basic)
    const { pluginID, chainId, gasOptions, gasOptionType, maxFee, GAS_OPTION_NAMES } = SettingsContext.useContainer()

    // only EVM is supported
    if (pluginID !== NetworkPluginID.PLUGIN_EVM) return null

    const isEIP1559 = chainResolver.isSupport(chainId, 'EIP1559')

    return (
        <div className={classes.root}>
            <Section
                title={t.gas_settings_label_gas_price()}
                additions={
                    <Typography className={classes.additions} component="span">
                        <span className={classes.label}>
                            {activeTab === GasSettingsType.Basic
                                ? GAS_OPTION_NAMES[gasOptionType]
                                : t.gas_settings_custom()}
                        </span>
                        <span className={classes.price}>
                            {' '}
                            {activeTab === GasSettingsType.Basic
                                ? new BigNumber(gasOptions?.[gasOptionType].suggestedMaxFeePerGas ?? 0).toFixed(2)
                                : new BigNumber(maxFee).toFixed(2)}{' '}
                            Gwei
                        </span>
                    </Typography>
                }>
                <TabContext value={activeTab}>
                    <MaskTabList
                        classes={{ root: classes.tabs }}
                        variant="round"
                        aria-label="Gas Tabs"
                        onChange={(event, tab) => setActiveTab(tab as GasSettingsType)}>
                        <Tab label={t.gas_settings_tab_basic()} value={GasSettingsType.Basic} />
                        <Tab label={t.gas_settings_tab_advanced()} value={GasSettingsType.Advanced} />
                    </MaskTabList>
                </TabContext>
                {activeTab === GasSettingsType.Basic ? (
                    <GasOptionSelector options={gasOptions} />
                ) : (
                    <>
                        <MaskAlert icon={<InfoIcon />} severity="info">
                            {t.gas_settings_error_low_gas_limit()}
                        </MaskAlert>
                        <Grid container direction="row" spacing={2}>
                            <Grid item xs={isEIP1559 ? 12 : 6}>
                                <MaskTextField
                                    className={classes.textfield}
                                    InputProps={{
                                        type: 'number',
                                    }}
                                    label={
                                        <Typography className={classes.caption}>
                                            {t.gas_settings_label_gas_limit()}
                                        </Typography>
                                    }
                                />
                            </Grid>
                            {isEIP1559 ? null : (
                                <Grid item xs={6}>
                                    <MaskTextField
                                        className={classes.textfield}
                                        InputProps={{
                                            type: 'number',
                                        }}
                                        label={
                                            <Typography className={classes.caption}>
                                                {t.gas_settings_label_gas_price()}
                                            </Typography>
                                        }
                                    />
                                </Grid>
                            )}
                        </Grid>
                        {isEIP1559 ? (
                            <>
                                <Grid container direction="row" spacing={2}>
                                    <Grid item xs={6}>
                                        <MaskTextField
                                            className={classes.textfield}
                                            InputProps={{
                                                type: 'number',
                                                endAdornment: <Typography className={classes.unit}>Gwei</Typography>,
                                            }}
                                            label={
                                                <Typography className={classes.caption}>
                                                    {t.gas_settings_label_max_priority_fee()}
                                                </Typography>
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <MaskTextField
                                            className={classes.textfield}
                                            InputProps={{
                                                type: 'number',
                                                endAdornment: <Typography className={classes.unit}>Gwei</Typography>,
                                            }}
                                            label={
                                                <Typography className={classes.caption}>
                                                    {t.gas_settings_label_max_fee()}
                                                </Typography>
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        ) : null}
                        <MaskAlert icon={<WarningIcon />} severity="error">
                            {t.gas_settings_error_low_gas_limit()}
                        </MaskAlert>
                    </>
                )}
            </Section>
        </div>
    )
}
