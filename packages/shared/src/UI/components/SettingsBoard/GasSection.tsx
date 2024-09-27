import { useState } from 'react'
import { makeStyles, MaskTabList } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { Tab, Typography } from '@mui/material'
import { NetworkPluginID } from '@masknet/shared-base'
import { GasOptionType, isZero, plus, formatCurrency } from '@masknet/web3-shared-base'
import { type ChainId, formatGweiToWei, formatWeiToGwei, type Transaction } from '@masknet/web3-shared-evm'
import { EVMUtils } from '@masknet/web3-providers'
import { GasOptionSelector } from './GasOptionSelector.js'
import { SettingsContext } from './Context.js'
import { Section } from './Section.js'
import { GasForm } from './GasForm.js'
import { GasSettingsType } from './types/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
        tabs: {
            overflow: 'visible',
            backgroundColor: theme.palette.maskColor.input,
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
        tab: {
            color: theme.palette.maskColor.second,
            '&[aria-selected="true"]': {
                color: theme.palette.maskColor.main,
            },
        },
    }
})

interface GasSectionProps {
    activeTab: GasSettingsType
    setActiveTab: (type: GasSettingsType) => void
    disableGasLimit?: boolean
}

export function GasSection(props: GasSectionProps) {
    const { activeTab, setActiveTab, disableGasLimit } = props
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
    const [maxPriorityFeePerGasByUser, setMaxPriorityFeePerGasByUser] = useState('0')

    // EVM only
    if (pluginID !== NetworkPluginID.PLUGIN_EVM) return null

    const isEIP1559 = EVMUtils.chainResolver.isFeatureSupported(chainId as ChainId, 'EIP1559')
    const suggestedMaxFeePerGas = gasOptions?.[gasOptionType ?? GasOptionType.NORMAL].suggestedMaxFeePerGas
    const suggestedMaxPriorityFeePerGas =
        gasOptions?.[gasOptionType ?? GasOptionType.NORMAL].suggestedMaxPriorityFeePerGas
    const baseFeePerGas = gasOptions?.[GasOptionType.FAST].baseFeePerGas ?? '0'
    const priorityFee =
        !isZero(maxPriorityFeePerGasByUser) ?
            formatGweiToWei(maxPriorityFeePerGasByUser)
        :   ((transaction as Transaction)?.maxPriorityFeePerGas as string)

    const gasPrice = (transactionOptions as Transaction | undefined)?.gasPrice

    const customPrice = formatCurrency(
        activeTab === GasSettingsType.Basic ?
            formatWeiToGwei(suggestedMaxFeePerGas ?? 0)
        :   formatWeiToGwei(
                isEIP1559 ?
                    plus(baseFeePerGas, priorityFee ?? suggestedMaxPriorityFeePerGas ?? 0)
                :   gasPrice ?? suggestedMaxFeePerGas ?? 0,
            ),
        '',
    )

    return (
        <div className={classes.root}>
            <Section
                title={<Trans>Gas Price</Trans>}
                additions={
                    gasOptionType ?
                        <Typography className={classes.additions} component="span">
                            <span className={classes.label}>
                                {activeTab === GasSettingsType.Basic ?
                                    GAS_OPTION_NAMES[gasOptionType]
                                :   <Trans>Custom</Trans>}
                            </span>
                            <span className={classes.price}>{` ${customPrice} Gwei`}</span>
                        </Typography>
                    :   null
                }>
                <TabContext value={activeTab}>
                    <MaskTabList
                        classes={{ root: classes.tabs }}
                        variant="round"
                        aria-label="Gas Tabs"
                        onChange={(event, tab) => setActiveTab(tab as GasSettingsType)}>
                        <Tab className={classes.tab} label={<Trans>Basic</Trans>} value={GasSettingsType.Basic} />
                        <Tab className={classes.tab} label={<Trans>Advanced</Trans>} value={GasSettingsType.Advanced} />
                    </MaskTabList>
                </TabContext>
                {activeTab === GasSettingsType.Basic ?
                    <GasOptionSelector
                        chainId={chainId as ChainId}
                        options={gasOptions}
                        onChange={(transactionOptions) => {
                            setTransactionOptions(transactionOptions)
                        }}
                    />
                : gasOptions ?
                    <GasForm
                        defaultGasLimit={customPrice}
                        disableGasLimit={disableGasLimit}
                        chainId={chainId as ChainId}
                        transaction={transaction as Transaction}
                        transactionOptions={transactionOptions as Partial<Transaction>}
                        gasOptions={gasOptions}
                        onChange={(transactionOptions) => {
                            setTransactionOptions(transactionOptions)
                        }}
                        maxPriorityFeePerGasByUser={maxPriorityFeePerGasByUser}
                        setMaxPriorityFeePerGasByUser={setMaxPriorityFeePerGasByUser}
                    />
                :   null}
            </Section>
        </div>
    )
}
