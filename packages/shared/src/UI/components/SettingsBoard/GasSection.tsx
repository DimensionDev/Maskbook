import { useState } from 'react'
import BigNumber from 'bignumber.js'
import { makeStyles, MaskColorVar, MaskTabList } from '@masknet/theme'
import { useSharedI18N } from '@masknet/shared'
import { TabContext } from '@mui/lab'
import { Tab, Typography } from '@mui/material'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId, Transaction } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { GasOptionSelector } from './GasOptionSelector'
import { Section } from './Section'
import { SettingsContext } from './Context'
import { GasForm } from './GasForm'

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
            fontSize: 14,
        },
        price: {
            fontWeight: 700,
        },
    }
})

export interface GasSectionProps {}

export function GasSection(props: GasSectionProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()
    const [activeTab, setActiveTab] = useState(GasSettingsType.Basic)
    const { pluginID, chainId, transaction, gasOption, setGasOption, gasOptions, gasOptionType, GAS_OPTION_NAMES } =
        SettingsContext.useContainer()

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
                            {` ${new BigNumber(gasOption?.suggestedMaxFeePerGas ?? 0).toFixed(2)}} `}
                            Gwei
                        </span>
                    </Typography>
                }>
                {pluginID === NetworkPluginID.PLUGIN_EVM ? (
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
                ) : null}
                {activeTab === GasSettingsType.Basic ? (
                    <GasOptionSelector
                        options={gasOptions}
                        onChange={(gasOption) => {
                            setGasOption(gasOption)
                        }}
                    />
                ) : transaction && gasOptions && pluginID === NetworkPluginID.PLUGIN_EVM ? (
                    <GasForm
                        chainId={chainId as ChainId}
                        transaction={transaction as Transaction}
                        gasOptions={gasOptions}
                        onChange={(gasOption) => {
                            if (!gasOption) setGasOption(null)
                            else setGasOption(gasOption as Web3Helper.GasOptionAll)
                        }}
                    />
                ) : null}
            </Section>
        </div>
    )
}
