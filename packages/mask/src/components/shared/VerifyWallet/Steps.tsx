import { makeStyles } from '@masknet/theme'
import { useState } from 'react'
import { CurrentWalletBox } from './CurrentWalletBox'
import {
    step1ActiveIcon,
    stepSuccessIcon,
    dividerDisableIcon,
    dividerSuccessIcon,
    dividerActiveIcon,
    step2DisableIcon,
    step2ActiveIcon,
} from './constants'
import { ImageIcon } from '@masknet/shared'

const useStyles = makeStyles()({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    stepBox: {
        marginTop: 12,
    },
    stepLine: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    stepRow: {
        display: 'flex',
        alignItems: 'center',
        minHeight: 200,
    },
    divider: {
        margin: '2px 0',
    },
})

export function Steps() {
    const { classes } = useStyles()
    const [step, setStep] = useState(0)

    const stepIconMap: any = {
        0: {
            step1: step1ActiveIcon,
            divider: dividerDisableIcon,
            step2: step2DisableIcon,
        },
        1: {
            step1: stepSuccessIcon,
            divider: dividerActiveIcon,
            step2: step2ActiveIcon,
        },
        2: {
            step1: stepSuccessIcon,
            divider: dividerSuccessIcon,
            step2: stepSuccessIcon,
        },
    }
    return (
        <div className={classes.container}>
            <CurrentWalletBox />
            <div className={classes.stepBox}>
                <div className={classes.stepLine}>
                    <ImageIcon size={24} icon={stepIconMap[step].step1} />
                    <img className={classes.divider} src={stepIconMap[step].divider} />
                    <ImageIcon size={24} icon={stepIconMap[step].step2} />
                </div>
            </div>
        </div>
    )
}
