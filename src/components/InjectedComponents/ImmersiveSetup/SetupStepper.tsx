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
import Services from '../../../extension/service'
import { useI18N } from '../../../utils/i18n-next-ui'

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
        header: { cursor: 'move' },
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
    const { t } = useI18N()
    const classes = useStyles()
    const steps = getSteps()
    const activeStep = props.currentStep
    const [, inputRef] = useCapturedInput(props.onUsernameChange)

    const ERROR_TEXT = t('immersive_setup_no_bio_got')

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
            <AppBar component="nav" position="static" className={classes.header}>
                <Toolbar variant="dense">
                    <Typography variant="h6">{t('immersive_setup_title')}</Typography>
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
            {/* {activeStep === steps.length && <Typography>{getBioStatus()}</Typography>} */}
        </aside>
    )
    /**
     * TODO: this UI is unused currently.
     * TODO: consider to use enum instead of boolean | 'detecting'
     */
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
        return [
            props.username
                ? t('immersive_setup_connect_as', { profile: props.username })
                : t('immersive_setup_connect_as_unknown'),
            t('immersive_setup_paste_into_bio'),
        ]
    }

    function getNextButton(step: ImmersiveSetupState): React.ReactNode {
        switch (step) {
            case ImmersiveSetupState.ConfirmUsername:
                return (
                    <ActionButtonPromise
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        executor={props.loadProfile}
                        init={t('immersive_setup_connect_profile')}
                        waiting={t('connecting')}
                        complete={t('next')}
                        failed={t('next')}
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
                        {t('next')}
                    </Button>
                )
        }
    }
    function getStepContent(step: ImmersiveSetupState): React.ReactNode {
        switch (step) {
            case ImmersiveSetupState.ConfirmUsername:
                return (
                    <>
                        <TextField
                            required
                            label={t('username')}
                            value={props.username}
                            onChange={e => props.onUsernameChange(e.currentTarget.value)}
                            innerRef={inputRef}
                        />
                        <br />
                        <Typography>{t('immersive_setup_username_confirm')}</Typography>
                        <Typography>
                            <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                color="textSecondary"
                                href="https://maskbook.com/faq/?2"
                                variant="body2">
                                {t('immersive_setup_help_dont_know_what_is_username')}
                            </Link>
                        </Typography>
                    </>
                )
            case ImmersiveSetupState.PasteBio:
                const provePostError = props.provePost === ERROR_TEXT
                if (provePostError) return <Typography className={classes.emptyProvePost}>{props.provePost}</Typography>
                return (
                    <>
                        <Typography component="address" className={classes.provePost}>
                            {props.provePost}
                        </Typography>
                        <Typography>{t('immersive_setup_add_bio_text')}</Typography>
                        {/* <Link style={{ textDecoration: 'underline' }} color="textSecondary" href="/" variant="body2">
                            Link text here, Link text here
                        </Link> */}
                        <br />
                        <ActionButtonPromise
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            executor={props.autoPasteProvePost}
                            init={t('immersive_setup_paste_into_bio_auto')}
                            waiting={t('adding')}
                            complete={t('done')}
                            failed={t('immersive_setup_paste_into_bio_failed')}
                            completeOnClick={props.onClose}
                            failedOnClick="use executor"
                        />
                    </>
                )
            default:
                return 'Unknown step'
        }
    }
}

function getUserID(x: ProfileIdentifier) {
    if (x.isUnknown) return ''
    return x.userId
}
export function ImmersiveSetupStepper(
    props: Partial<ImmersiveSetupStepperUIProps> &
        Pick<ImmersiveSetupStepperUIProps, 'onClose'> & { persona: PersonaIdentifier },
) {
    const { t } = useI18N()
    const ERROR_TEXT = t('immersive_setup_no_bio_got')

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
        if (step === ImmersiveSetupState.ConfirmUsername && lastState.username && lastState.status === 'during') {
            setStep(ImmersiveSetupState.PasteBio)
        }
    }, [step, setStep, lastState])

    const lastRecognized = useValueRef(getActivatedUI().lastRecognizedIdentity)
    const touched = React.useRef(false)
    const [username, setUsername] = React.useState(lastState.username || '')
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
            autoPasteProvePost={async () => {
                if (provePost === ERROR_TEXT) throw new Error('')
                await navigator.clipboard.writeText(provePost)
                await sleep(400)
                ui.taskPasteIntoBio(provePost)
            }}
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
    const connecting = new ProfileIdentifier(ui.networkIdentifier, finalUsername)
    Services.Identity.attachProfile(connecting, props.persona, { connectionConfirmState: 'confirmed' })
    ui.taskGotoProfilePage(connecting)
    await sleep(400)
}
