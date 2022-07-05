import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import { useSharedI18N } from '@masknet/shared'
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
    onSubmit?(settings: { slippageTolerance?: number; transaction?: Web3Helper.TransactionAll }): void
}

export function SettingsBoard(props: SettingsBoardProps) {
    const { disableGasPrice = false, disableSlippageTolerance = false, onSubmit } = props
    const { classes } = useStyles()
    const t = useSharedI18N()
    const { transaction, transactionOptions, slippageTolerance } = SettingsContext.useContainer()

    return (
        <div className={classes.root}>
            {disableGasPrice ? null : <GasSection />}
            {disableSlippageTolerance ? null : <SlippageToleranceSection />}
            <Button
                className={classes.button}
                fullWidth
                variant="contained"
                color="primary"
                disabled={
                    (!disableGasPrice && !transactionOptions) || (!disableSlippageTolerance && slippageTolerance === 0)
                }
                onClick={() =>
                    onSubmit?.({
                        slippageTolerance: slippageTolerance * 100, // convert to bips
                        transaction,
                    })
                }>
                {t.dialog_confirm()}
            </Button>
        </div>
    )
}
