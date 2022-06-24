import { makeStyles } from '@masknet/theme'
import { GasSection } from './GasSection'
import { SlippageToleranceSection } from './SlippageToleranceSection'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
    }
})

export interface SettingsBoardProps {}

export function SettingsBoard(props: SettingsBoardProps) {
    const { classes } = useStyles()

    return (
        <div className={classes.root}>
            <GasSection />
            <SlippageToleranceSection />
        </div>
    )
}
