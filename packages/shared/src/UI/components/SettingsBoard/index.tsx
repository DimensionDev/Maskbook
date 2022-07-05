import { useEffect } from 'react'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { SettingsContext } from './Context'
import { GasSection } from './GasSection'
import { SlippageToleranceSection } from './SlippageToleranceSection'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
        button: {
            marginTop: theme.spacing(2),
        },
    }
})

export interface SettingsBoardProps {
    disableGasPrice?: boolean
    disableSlippageTolerance?: boolean
    onChange?(settings: { slippageTolerance?: number; transaction?: Web3Helper.TransactionAll }): void
}

export function SettingsBoard(props: SettingsBoardProps) {
    const { disableGasPrice = false, disableSlippageTolerance = false, onChange } = props
    const { classes } = useStyles()
    const { transaction, transactionOptions, slippageTolerance } = SettingsContext.useContainer()

    useEffect(() => {
        onChange?.({
            transaction: (transaction
                ? {
                      ...transaction,
                      ...transactionOptions,
                  }
                : undefined) as Web3Helper.TransactionAll | undefined,
            slippageTolerance: slippageTolerance * 100, // convert to bips
        })
    }, [JSON.stringify(transaction), JSON.stringify(transactionOptions), slippageTolerance, onChange])

    return (
        <div className={classes.root}>
            {disableGasPrice ? null : <GasSection />}
            {disableSlippageTolerance ? null : <SlippageToleranceSection />}
        </div>
    )
}
