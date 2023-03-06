import { useState } from 'react'
import { makeStyles, MaskTabList } from '@masknet/theme'
import { useSharedI18N } from '@masknet/shared'
import { TabContext } from '@mui/lab'
import { Tab, Typography } from '@mui/material'
import { NetworkPluginID, GasOptionType, isZero, plus, formatCurrency } from '@masknet/web3-shared-base'
import { ChainId, formatGweiToWei, formatWeiToGwei, Transaction } from '@masknet/web3-shared-evm'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { GasOptionSelector } from './GasOptionSelector.js'
import { SettingsContext } from './Context.js'
import { Section } from './Section.js'
import { GasForm } from './GasForm.js'
import { GasSettingsType } from './types/index.js'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
        tabs: {
            overflow: 'visible',
        },
        additions: {
            fontWeight: 700,
        },
        label: {
            color: theme.palette.maskColor.second,
            fontWeight: 700,
        },
        price: {
            fontWeight: 700,
        },
    }
})

export interface GasSectionProps {
    activeTab: GasSettingsType
    setActiveTab: (type: GasSettingsType) => void
    disableGasLimit?: boolean
}

export function GasSection(props: GasSectionProps) {
    const { activeTab, setActiveTab, disableGasLimit } = props

    const t = useSharedI18N()
    const { classes } = useStyles()
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
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const [maxPriorityFeePerGasByUser, setMaxPriorityFeePerGasByUser] = useState('0')

    // EVM only
    if (pluginID !== NetworkPluginID.PLUGIN_EVM) return null

    const isEIP1559 = Others?.chainResolver.isSupport(chainId as ChainId, 'EIP1559')
    const suggestedMaxFeePerGas = gasOptions?.[gasOptionType ?? GasOptionType.NORMAL].suggestedMaxFeePerGas as
        | string
        | undefined
    const suggestedMaxPriorityFeePerGas =
        gasOptions?.[gasOptionType ?? GasOptionType.NORMAL].suggestedMaxPriorityFeePerGas
    const baseFeePerGas = gasOptions?.[GasOptionType.FAST].baseFeePerGas ?? '0'
    const priorityFee = !isZero(maxPriorityFeePerGasByUser)
        ? formatGweiToWei(maxPriorityFeePerGasByUser)
        : ((transaction as Transaction)?.maxPriorityFeePerGas as string)

    const gasPrice = (transactionOptions as Transaction | undefined)?.gasPrice

    const customPrice = formatCurrency(
        activeTab === GasSettingsType.Basic
            ? formatWeiToGwei(suggestedMaxFeePerGas ?? 0)
            : formatWeiToGwei(
                  isEIP1559
                      ? plus(baseFeePerGas, priorityFee ?? suggestedMaxPriorityFeePerGas ?? 0)
                      : gasPrice ?? suggestedMaxFeePerGas ?? 0,
              ),
        '',
    )

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
                            <span className={classes.price}>{` ${customPrice} Gwei`}</span>
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
                ) : gasOptions ? (
                    <GasForm
                        disableGasLimit={disableGasLimit}
                        chainId={chainId as ChainId}
                        transaction={transaction as Transaction}
                        transactionOptions={transactionOptions as Partial<Transaction>}
                        gasOptions={gasOptions}
                        onChange={(transactionOptions) => {
                            setTransactionOptions(transactionOptions ?? null)
                        }}
                        maxPriorityFeePerGasByUser={maxPriorityFeePerGasByUser}
                        setMaxPriorityFeePerGasByUser={setMaxPriorityFeePerGasByUser}
                    />
                ) : null}
            </Section>
        </div>
    )
}
