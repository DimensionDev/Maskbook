import { makeStyles, useCustomSnackbar } from '@masknet/theme'
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
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { useEffect } from 'react'

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
        minHeight: 200,
    },
    stepRow: {
        color: theme.palette.text.secondary,
        minHeight: 100,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: 700,
    },

    stepIntro: {
        marginTop: 12,
        fontSize: 12,
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
    roundBtn: {
        borderRadius: 99,
    },
    disableBtn: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
}))

export enum SignSteps {
    Ready = 0,
    FirstStepDone = 1,
    SecondStepDone = 2,
}

interface StepsProps {
    step: SignSteps
    personaSign: () => void
    walletSign: () => void
    changeWallet: () => void
    onDone: () => void
    persona: any
    wallet: any
    disableConfirm?: boolean
}

export function Steps(props: StepsProps) {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { step, personaSign, walletSign, changeWallet, persona, wallet, onDone, disableConfirm } = props
    const { showSnackbar } = useCustomSnackbar()
    const stepIconMap = {
        [SignSteps.Ready]: {
            step1: step1ActiveIcon,
            divider: dividerDisableIcon,
            step2: step2DisableIcon,
        },
        [SignSteps.FirstStepDone]: {
            step1: stepSuccessIcon,
            divider: dividerActiveIcon,
            step2: step2ActiveIcon,
        },
        [SignSteps.SecondStepDone]: {
            step1: stepSuccessIcon,
            divider: dividerSuccessIcon,
            step2: stepSuccessIcon,
        },
    }

    useEffect(() => {
        if (disableConfirm) {
            showSnackbar('The wallet has been bound.Please switch wallets.', { variant: 'error' })
        }
    }, [disableConfirm])

    const onConfirm = () => {
        if (step === SignSteps.Ready) {
            personaSign()
        } else if (step === SignSteps.FirstStepDone) {
            walletSign()
        } else {
            onDone()
        }
    }

    const onCancel = () => {
        navigate(-1)
    }

    return (
        <div className={classes.container}>
            <CurrentWalletBox changeWallet={changeWallet} />
            <div className={classes.stepBox}>
                <div className={classes.stepLine}>
                    <ImageIcon size={22} icon={stepIconMap[step].step1} />
                    <img className={classes.divider} src={stepIconMap[step].divider.toString()} />
                    <ImageIcon size={22} icon={stepIconMap[step].step2} />
                </div>
                <div className={classes.stepRowBox}>
                    <div className={classes.stepRow}>
                        <Typography className={classes.stepTitle}>{persona.nickname ?? 'Persona Name'} Sign</Typography>
                        <Typography className={classes.stepIntro}>
                            Sign seamlessly with Persona, ensure the validity of data.
                        </Typography>
                    </div>
                    <div className={classes.stepRow}>
                        <Typography className={classes.stepTitle}>{wallet.name ?? wallet.providerType} Sign</Typography>
                        <Typography className={classes.stepIntro}>
                            After two steps, you will own, view, utilize all your cyber identities through Next.ID. You
                            can also disconnect them easily.
                        </Typography>
                    </div>
                </div>
            </div>
            <div className={classes.actionBox}>
                <ActionButton
                    className={classes.roundBtn}
                    variant="outlined"
                    size="large"
                    fullWidth
                    color="primary"
                    onClick={onCancel}>
                    Cancel
                </ActionButton>
                <ActionButton
                    className={disableConfirm ? classNames(classes.roundBtn, classes.disableBtn) : classes.roundBtn}
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={onConfirm}>
                    {disableConfirm ? 'Persona Sign' : step === 2 ? 'Done' : 'Confirm'}
                </ActionButton>
            </div>
        </div>
    )
}
