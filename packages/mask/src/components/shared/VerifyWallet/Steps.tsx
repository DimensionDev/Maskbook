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
import { useNavigate } from 'react-router-dom'
import { useValueRef } from '@masknet/shared-base-ui'
import { currentPersonaIdentifier } from '../../../settings/settings'
import { ECKeyIdentifier, Identifier, NextIDAction, NextIDPlatform } from '@masknet/shared-base'
import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import { NextIDProof } from '@masknet/web3-providers'

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
    roundBtn: {
        borderRadius: 99,
    },
}))

enum SignSteps {
    Ready = 0,
    Step1Done = 1,
    Step2Done = 2,
}

export function Steps() {
    const { classes } = useStyles()
    const [step, setStep] = useState(0)
    const navigate = useNavigate()
    const currentIdentifier = Identifier.fromString(useValueRef(currentPersonaIdentifier), ECKeyIdentifier)
    const { value: persona_ } = useAsync(async () => {
        return Services.Identity.queryPersona(currentIdentifier.unwrap())
    }, [])

    if (!persona_ || !persona_.publicHexKey) return null

    const stepIconMap: any = {
        [SignSteps.Ready]: {
            step1: step1ActiveIcon,
            divider: dividerDisableIcon,
            step2: step2DisableIcon,
        },
        [SignSteps.Step1Done]: {
            step1: stepSuccessIcon,
            divider: dividerActiveIcon,
            step2: step2ActiveIcon,
        },
        [SignSteps.Step2Done]: {
            step1: stepSuccessIcon,
            divider: dividerSuccessIcon,
            step2: stepSuccessIcon,
        },
    }

    const onConfirm = () => {
        if (step === SignSteps.Ready) {
            personaSlientSign()
        } else if (step === SignSteps.Step1Done) {
            walletSign()
        } else {
            navigate(-1)
        }
    }

    const personaSlientSign = async () => {
        try {
            const payload = await NextIDProof.createPersonaPayload(
                persona_.publicHexKey as string,
                NextIDAction.Create,
                persona_.nickname as string,
                NextIDPlatform.Ethereum,
                'default',
            )
            if (!payload) throw new Error('Failed to create persona payload.')
            const signResult = await Services.Identity.generateSignResult(
                currentIdentifier.val as any,
                payload.signPayload,
            )
            if (!signResult) throw new Error('Failed to sign persona.')
            setStep(1)
        } catch (error) {
            console.error(error)
        }
    }
    const walletSign = async () => {
        console.log('wallet sign')
        setStep(2)
    }
    const onCancel = () => {
        navigate(-1)
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
                    className={classes.roundBtn}
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={onConfirm}>
                    {step === 2 ? 'Done' : 'Confirm'}
                </ActionButton>
            </div>
        </div>
    )
}
