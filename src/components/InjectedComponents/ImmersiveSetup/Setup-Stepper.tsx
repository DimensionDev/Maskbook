import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { TextField, Link, AppBar, Toolbar, IconButton } from '@material-ui/core'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { getActivatedUI } from '../../../social-network/ui'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { ProfileIdentifier, PersonaIdentifier } from '../../../database/type'
import { useCapturedInput } from '../../../utils/hooks/useCapturedEvents'
import CloseIcon from '@material-ui/icons/Close'
import { currentImmersiveSetupStatus, ImmersiveSetupCrossContextStatus } from '../../shared-settings/settings'

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
        provePost: {
            wordBreak: 'break-all',
            padding: 6,
            border: `1px solid ${theme.palette.divider}`,
        },
        emptyProvePost: {
            padding: 6,
            border: `1px solid ${theme.palette.error.main}`,
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
    autoPasteProvePost(): Promise<void>
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
    const [, inputRef] = useCapturedInput(props.onUsernameChange)

    // const backButton = (
    //     <Button onClick={props.back} className={classes.button}>
    //         Back
    //     </Button>
    // )
    const actions = (
        <div>
            {/* TODO: Implement back(including side effects rollback) for step 1  */}
            {/* {activeStep <= 1 ? null : backButton} */}
            {getNextButton(activeStep)}
        </div>
    )
    return (
        <aside className={classes.root}>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <Typography variant="h6">Setup Maskbook</Typography>
                    <div style={{ flex: 1 }} />
                    <IconButton edge="end" color="inherit" onClick={props.onClose}>
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
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
            {activeStep === steps.length && <Typography>{getBioStatus()}</Typography>}
        </aside>
    )
    function getBioStatus() {
        switch (props.bioSet) {
            case 'detecting':
                return `Checking if Maskbook has setup correctly`
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
                        init="Yes, I'm sure"
                        waiting="Go to profile"
                        complete="Next"
                        failed="Next"
                        disabled={props.username.length === 0}
                    />
                )
            case ImmersiveSetupState.PasteBio:
                return null
            // return (
            //     <Button variant="contained" color="primary" onClick={props.onClose} className={classes.button}>
            //         Finish
            //     </Button>
            // )
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
                            innerRef={inputRef}
                        />
                        <br />
                        <Typography>Maskbook needs your username to connect your account. Does it correct? </Typography>
                        <Typography>
                            <Link color="textSecondary" href="/" variant="body2">
                                But I don't know what my username is!
                            </Link>
                        </Typography>
                    </>
                )
            case ImmersiveSetupState.PasteBio:
                const provePostError = props.provePost === ERROR_TEXT
                if (provePostError) return <Typography className={classes.emptyProvePost}>{props.provePost}</Typography>
                return (
                    <>
                        <Typography className={classes.provePost}>{props.provePost}</Typography>
                        <Typography>Please add this text to your bio. Don't remove or change any of it!</Typography>
                        <ActionButtonPromise
                            variant="contained"
                            color="secondary"
                            className={classes.button}
                            executor={props.autoPasteProvePost}
                            init="Add it for me!"
                            waiting="Adding..."
                            complete="Done!"
                            failed="Failed... Please add it to your bio manually!"
                            completeOnClick="use executor"
                            failedOnClick="use executor"
                        />
                    </>
                )
            default:
                return 'Unknown step'
        }
    }
}

const ERROR_TEXT = 'Maskbook have some problems when setting up! Please report this to Maskbook developer!'

function getUserID(x: ProfileIdentifier) {
    if (x.isUnknown) return ''
    return x.userId
}
export function ImmersiveSetupStepper(
    props: Partial<ImmersiveSetupStepperUIProps> &
        Pick<ImmersiveSetupStepperUIProps, 'onClose'> & { persona: PersonaIdentifier },
) {
    const [step, setStep] = React.useState(ImmersiveSetupState.ConfirmUsername)

    const ui = getActivatedUI()
    const lastStateRef = currentImmersiveSetupStatus[ui.networkIdentifier]
    const lastState_ = useValueRef(lastStateRef)
    const lastState = React.useMemo<ImmersiveSetupCrossContextStatus>(() => {
        try {
            return JSON.parse(lastState_)
        } catch {
            return {}
        }
    }, [lastState_])
    React.useEffect(() => {
        if (step === ImmersiveSetupState.ConfirmUsername && lastState.status === 'during') {
            setStep(ImmersiveSetupState.PasteBio)
        }
    }, [step, setStep, lastState])

    const lastRecognized = useValueRef(getActivatedUI().lastRecognizedIdentity)
    const touched = React.useRef(false)
    const [username, setUsername] = React.useState(getUserID(lastRecognized.identifier))
    if (username === '' && touched.current === false) {
        const uid = getUserID(lastRecognized.identifier)
        uid !== '' && setUsername(uid)
    }

    const back = () => setStep(step - 1)
    const next = () => setStep(step + 1)
    const provePost = props.provePost || ERROR_TEXT
    return (
        <ImmersiveSetupStepperUI
            // ? currentStep back next is a self managed group
            currentStep={step}
            back={back}
            next={next}
            // ? username & onUsernameChange is a self managed group
            username={username}
            onUsernameChange={v => {
                setUsername(v)
                touched.current = true
            }}
            autoPasteProvePost={() => navigator.clipboard.writeText(provePost).then(() => sleep(400))}
            bioSet="detecting"
            {...props}
            onClose={() => {
                props.onClose()
                lastStateRef.value = ''
            }}
            loadProfile={() => (props.loadProfile?.() || defaultLoadProfile?.(props, username)).finally(next)}
            provePost={provePost}
        />
    )
}
async function defaultLoadProfile(props: { username?: string; persona: PersonaIdentifier }, username: string) {
    const ui = getActivatedUI()
    const finalUsername = props.username || username
    currentImmersiveSetupStatus[ui.networkIdentifier].value = JSON.stringify({
        status: 'during',
        username: finalUsername,
        persona: props.persona.toText(),
    } as ImmersiveSetupCrossContextStatus)
    ui.taskGotoProfilePage(new ProfileIdentifier(ui.networkIdentifier, finalUsername))
    await sleep(400)
}
