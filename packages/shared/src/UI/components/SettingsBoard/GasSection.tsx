import { makeStyles, MaskAlert, MaskColorVar, MaskTabList, MaskTextField } from '@masknet/theme'
import { useSharedI18N } from '@masknet/shared'
import { Grid, Tab, Typography } from '@mui/material'
import { Section } from './Section'
import { InfoIcon, WarningIcon } from '@masknet/icons'
import { GasOptionSelector } from './GasOptionSelector'
import type { GasOption } from './GasOption'
import { GasOptionType } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
import { useState } from 'react'

enum GasSettingsType {
    Basic = 'Basic',
    Advanced = 'Advanced',
}

const GAS_OPTIONS: GasOption[] = [
    {
        type: GasOptionType.SLOW,
        estimatedSeconds: 20,
        suggestedMaxFeePerGas: '30000000',
    },
    {
        type: GasOptionType.NORMAL,
        estimatedSeconds: 30,
        suggestedMaxFeePerGas: '40000000',
    },
    {
        type: GasOptionType.FAST,
        estimatedSeconds: 40,
        suggestedMaxFeePerGas: '50000000',
    },
]

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

    return (
        <div className={classes.root}>
            <Section
                title={t.gas_settings_info_gas_fee({
                    fee: '2.5',
                })}
                additions={
                    <Typography className={classes.additions} component="span">
                        <span className={classes.label}>{t.gas_settings_custom()}</span>
                        <span className={classes.price}> 199.00 Gwei</span>
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
                    <GasOptionSelector options={GAS_OPTIONS} />
                ) : (
                    <>
                        <MaskAlert icon={<InfoIcon />} severity="info">
                            {t.gas_settings_error_low_gas_limit()}
                        </MaskAlert>
                        <Grid container direction="row" spacing={2}>
                            <Grid item xs={12}>
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
                        </Grid>
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
                        <MaskAlert icon={<WarningIcon />} severity="error">
                            {t.gas_settings_error_low_gas_limit()}
                        </MaskAlert>
                    </>
                )}
            </Section>
        </div>
    )
}
