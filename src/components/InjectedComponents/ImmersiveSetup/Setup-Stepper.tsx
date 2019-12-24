import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { TextField, Link } from '@material-ui/core'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { sleep } from '@holoflows/kit/es/util/sleep'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 350,
        },
        button: {
            marginTop: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        resetContainer: {
            marginTop: theme.spacing(-1),
            padding: theme.spacing(0, 3, 2),
        },
    }),
)

export enum ImmersiveSetupState {
    ConfirmUsername,
    PasteBio,
    Finished,
}
export interface ImmersiveSetupStepperUIProps {
    loadProfile(): Promise<void>
    copyProvePost(): Promise<void>
    bioSet: 'detecting' | boolean
    currentStep: ImmersiveSetupState
    back(): void
    next(): void
    provePost: string
    username: string
    onUsernameChange: (newUserName: string) => void
    onClose(): void
}
export function ImmersiveSetupStepperUI(props: ImmersiveSetupStepperUIProps) {
    const classes = useStyles()
    const steps = getSteps()
    const activeStep = props.currentStep

    const backButton = (
        <Button onClick={props.back} className={classes.button}>
            Back
        </Button>
    )
    const actions = (
        <div>
            {activeStep === 0 ? null : backButton}
            {getNextButton(activeStep)}
        </div>
    )
    return (
        <div className={classes.root}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                    <Step key={index}>
                        <StepLabel>{label}</StepLabel>
                        <StepContent>
                            {getStepContent(index)}
                            {actions}
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
            <Paper square elevation={0} className={classes.resetContainer}>
                {activeStep === steps.length && <Typography>{getBioStatus()}</Typography>}
                <Button className={classes.button} onClick={props.onClose}>
                    Quit the setup
                </Button>
            </Paper>
        </div>
    )
    function getBioStatus() {
        switch (props.bioSet) {
            case 'detecting':
                return 'Checking...'
            case true:
                return "You're done!"
            case false:
                return 'Maskbook cannot check if you have setup successfully, maybe you should check again'
        }
    }
    function getSteps() {
        return [`Connect as ${props.username || 'who'}?`, 'Paste your key to your bio']
    }

    function getNextButton(step: number): React.ReactNode {
        switch (step) {
            case ImmersiveSetupState.ConfirmUsername:
                return (
                    <ActionButtonPromise
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        executor={props.loadProfile}
                        init="Go to profile"
                        waiting="Going to profile"
                        complete="Next"
                        failed="Next"
                        disabled={props.username.length === 0}
                    />
                )
            case ImmersiveSetupState.PasteBio:
                return (
                    <Button variant="contained" color="primary" onClick={props.next} className={classes.button}>
                        Finish
                    </Button>
                )
            default:
                return (
                    <Button variant="contained" color="primary" onClick={props.next} className={classes.button}>
                        Next
                    </Button>
                )
        }
    }
    function getStepContent(step: number): React.ReactNode {
        switch (step) {
            case ImmersiveSetupState.ConfirmUsername:
                return (
                    <>
                        <TextField
                            required
                            label="User Name"
                            value={props.username}
                            onChange={e => props.onUsernameChange(e.currentTarget.value)}
                        />
                        <br />
                        <Typography>Maskbook needs your username to connect your account. Does it correct? </Typography>
                        <Typography>
                            <Link href="/" variant="body2">
                                But I don't know what my username is!
                            </Link>
                        </Typography>
                    </>
                )
            case ImmersiveSetupState.PasteBio:
                return (
                    <>
                        <Typography
                            style={{
                                wordBreak: 'break-all',
                                padding: '6px 0px',
                            }}>
                            {props.provePost}
                        </Typography>
                        <ActionButtonPromise
                            variant="contained"
                            color="secondary"
                            className={classes.button}
                            executor={props.copyProvePost}
                            init="Copy to clipboard"
                            waiting="Copying to clipboard"
                            complete="Copied!"
                            failed="Copy failed"
                            completeOnClick="use executor"
                        />
                        <Typography>This text can help your friend get your crypto key. Don't remove it!</Typography>
                    </>
                )
            default:
                return 'Unknown step'
        }
    }
}

export function ImmersiveSetupStepper(props: Partial<ImmersiveSetupStepperUIProps>) {
    const [step, setStep] = React.useState(ImmersiveSetupState.ConfirmUsername)
    // TODO: default impl: auto detect
    const [username, setUsername] = React.useState('')
    const back = () => setStep(step - 1)
    const next = () => setStep(step + 1)
    const provePost = props.provePost || '🎭A81Kg7HVsITcftN/0IBp2q6+IyfZCYHntkVsMTRl741L0🎭'
    return (
        <ImmersiveSetupStepperUI
            currentStep={step}
            back={back}
            next={next}
            username={username}
            onUsernameChange={setUsername}
            copyProvePost={() => navigator.clipboard.writeText(provePost).then(q => sleep(400))}
            bioSet="detecting"
            // TODO: default impl: call ui
            onClose={() => {}}
            {...props}
            // TODO: default impl: call ui
            loadProfile={() => (props.loadProfile?.() || Promise.resolve()).finally(next)}
            provePost={provePost}
        />
    )
}
