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
import { Typography } from '@mui/material'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    stepBox: {
        marginTop: 12,
        display: 'flex',
        alignItems: 'flex-start',
        flexGrow: 'grow',
    },
    stepLine: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 12,
    },
    stepRowBox: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 200,
    },
    stepRow: {
        color: theme.palette.text.secondary,
        minHeight: 100,
    },
    stepIntro: {
        marginTop: 12,
        fontSize: 14,
    },
    divider: {
        margin: '4px 0',
    },
    actionBox: {
        width: 'calc(100% - 32px)',
        gap: 12,
        position: 'fixed',
        bottom: 16,
        display: 'flex',
        alignItems: 'center',
    },
}))

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
                <div className={classes.stepRowBox}>
                    <div className={classes.stepRow}>
                        <Typography sx={{ fontWeight: 'bold' }}>Persona Name Sign</Typography>
                        <Typography className={classes.stepIntro}>
                            Sign seamlessly with Persona, ensure the validity of data.
                        </Typography>
                    </div>
                    <div className={classes.stepRow}>
                        <Typography sx={{ fontWeight: 'bold' }}>Wallet Name Sign</Typography>
                        <Typography className={classes.stepIntro}>
                            After two steps, you will own, view, utilize all your cyber identities through Next.ID. You
                            can also disconnect them easily.
                        </Typography>
                    </div>
                </div>
            </div>
            <div className={classes.actionBox}>
                <ActionButton variant="outlined" size="large" fullWidth color="primary">
                    Cancel
                </ActionButton>
                <ActionButton variant="contained" size="large" fullWidth>
                    {step === 2 ? 'Done' : 'Confirm'}
                </ActionButton>
            </div>
        </div>
    )
}
