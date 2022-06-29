import { useState } from 'react'
import BigNumber from 'bignumber.js'
import { makeStyles, MaskColorVar, MaskTabList } from '@masknet/theme'
import { useSharedI18N } from '@masknet/shared'
import { TabContext } from '@mui/lab'
import { Tab, Typography } from '@mui/material'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, formatWeiToGwei, Transaction } from '@masknet/web3-shared-evm'
import { GasOptionSelector } from './GasOptionSelector'
import { SettingsContext } from './Context'
import { Section } from './Section'
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
    const {
        pluginID,
        chainId,
        transaction,
        transactionOptions,
        setTransactionOptions,
        gasOptions,
        gasOptionType,
        GAS_OPTION_NAMES,
    } = SettingsContext.useContainer()

    // EVM only
    if (pluginID !== NetworkPluginID.PLUGIN_EVM) return null

    return (
        <div className={classes.root}>
            <Section
                title={t.gas_settings_label_gas_price()}
                additions={
                    gasOptionType ? (
                        <Typography className={classes.additions} component="span">
                            <span className={classes.label}>
                                {activeTab === GasSettingsType.Basic
                                    ? GAS_OPTION_NAMES[gasOptionType]
                                    : t.gas_settings_custom()}
                            </span>
                            {activeTab === GasSettingsType.Basic ? (
                                <span className={classes.price}>
                                    {` ${new BigNumber(
                                        (gasOptions?.[gasOptionType].suggestedMaxFeePerGas as string | undefined) ?? 0,
                                    ).toFixed(2)} `}
                                    Gwei
                                </span>
                            ) : (
                                <span className={classes.price}>
                                    {` ${
                                        transactionOptions
                                            ? formatWeiToGwei(
                                                  ((transactionOptions as Transaction).maxFeePerGas as
                                                      | string
                                                      | undefined) ?? 0,
                                              ).toFixed(2)
                                            : 0
                                    } `}
                                    Gwei
                                </span>
                            )}
                        </Typography>
                    ) : null
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
                    <GasOptionSelector
                        chainId={chainId as ChainId}
                        options={gasOptions}
                        onChange={(transactionOptions) => {
                            setTransactionOptions(transactionOptions)
                        }}
                    />
                ) : transaction && gasOptions ? (
                    <GasForm
                        chainId={chainId as ChainId}
                        transaction={transaction as Transaction}
                        gasOptions={gasOptions}
                        onChange={(transactionOptions) => {
                            setTransactionOptions(transactionOptions ?? null)
                        }}
                    />
                ) : null}
            </Section>
        </div>
    )
}
