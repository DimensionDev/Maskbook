import { useEffect } from 'react'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SettingsContext } from './Context.js'
import { GasSection } from './GasSection.js'
import { SlippageToleranceSection } from './SlippageToleranceSection.js'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
    }
})

interface SettingsBoardProps {
    disableGasPrice?: boolean
    disableGasLimit?: boolean
    disableSlippageTolerance?: boolean
    onChange?(settings: { slippageTolerance?: number; transaction?: Web3Helper.TransactionAll }): void
}

export function SettingsBoard(props: SettingsBoardProps) {
    const { disableGasPrice = false, disableSlippageTolerance = false, onChange, disableGasLimit } = props
    const { classes } = useStyles()
    const { transaction, transactionOptions, slippageTolerance, gasSettingsType, setGasSettingsType } =
        SettingsContext.useContainer()

    useEffect(() => {
        onChange?.({
            transaction: (transaction ?
                {
                    ...transaction,
                    ...transactionOptions,
                }
            :   undefined) as Web3Helper.TransactionAll | undefined,
            slippageTolerance: slippageTolerance * 100,
        })
    }, [JSON.stringify(transaction), JSON.stringify(transactionOptions), slippageTolerance, onChange])

    return (
        <div className={classes.root}>
            {disableGasPrice ? null : (
                <GasSection
                    activeTab={gasSettingsType}
                    setActiveTab={setGasSettingsType}
                    disableGasLimit={disableGasLimit}
                />
            )}
            {disableSlippageTolerance ? null : <SlippageToleranceSection />}
        </div>
    )
}
