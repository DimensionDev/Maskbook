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
    onSubmit?(settings: { slippageTolerance?: number; option?: Web3Helper.GasOptionAll }): void
}

export function SettingsBoard(props: SettingsBoardProps) {
    const { disableGasPrice = false, disableSlippageTolerance = false, onSubmit } = props
    const { classes } = useStyles()
    const t = useSharedI18N()
    const { gasOptions, gasOptionType, slippageTolerance } = SettingsContext.useContainer()

    return (
        <div className={classes.root}>
            {disableGasPrice ? null : <GasSection />}
            {disableSlippageTolerance ? null : <SlippageToleranceSection />}
            <Button
                className={classes.button}
                fullWidth
                variant="contained"
                color="primary"
                onClick={() =>
                    onSubmit?.({
                        slippageTolerance,
                        option: gasOptions?.[gasOptionType],
                    })
                }>
                {t.dialog_confirm()}
            </Button>
        </div>
    )
}
