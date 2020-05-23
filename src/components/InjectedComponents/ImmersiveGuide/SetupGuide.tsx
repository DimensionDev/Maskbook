import React, { useState, useMemo, useEffect } from 'react'
import {
    makeStyles,
    createStyles,
    Paper,
    Typography,
    TextField,
    Theme,
    ThemeProvider,
    InputAdornment,
    LinearProgress,
    useTheme,
} from '@material-ui/core'
import classNames from 'classnames'
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail'
import CloseIcon from '@material-ui/icons/Close'
import ActionButton, { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import ShowcaseBox from '../../../extension/options-page/DashboardComponents/ShowcaseBox'
import { merge, cloneDeep, noop } from 'lodash-es'
import { useI18N } from '../../../utils/i18n-next-ui'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { getActivatedUI } from '../../../social-network/ui'
import { currentImmersiveSetupStatus, ImmersiveSetupCrossContextStatus } from '../../shared-settings/settings'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { useCapturedInput } from '../../../utils/hooks/useCapturedEvents'
import { PersonaIdentifier, ProfileIdentifier } from '../../../database/type'
import Services from '../../../extension/service'

export enum SetupGuideStep {
    FindUsername = 'find-username',
    PasteIntoBio = 'paste-into-bio',
}
//#region wizard dialog
const wizardTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        palette: {
            secondary: theme.palette.warning,
        },
        overrides: {
            MuiOutlinedInput: {
                input: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
                multiline: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
                notchedOutline: {
                    borderColor: '#EAEAEA',
                },
            },
            MuiInputLabel: {
                outlined: {
                    transform: 'translate(14px, 16px) scale(1)',
                },
            },
            MuiTextField: {
                root: {
                    marginTop: theme.spacing(2),
                    marginBottom: 0,

                    '&:first-child': {
                        marginTop: 0,
                    },
                },
            },
            MuiButton: {
                root: {
                    '&[hidden]': {
                        visibility: 'hidden',
                    },
                },
                text: {
                    height: 28,
                    lineHeight: 1,
                    paddingTop: 0,
                    paddingBottom: 0,
                },
            },
        },
        props: {
            MuiButton: {
                size: 'medium',
            },
            MuiTextField: {
                fullWidth: true,
                variant: 'outlined',
                margin: 'normal',
            },
        },
    })

const wizardSuccessTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        palette: {
            secondary: theme.palette.success,
        },
    })

const wizardErrorTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        palette: {
            secondary: theme.palette.error,
        },
    })

const useWizardDialogStyles = makeStyles((theme) =>
    createStyles({
        root: {
            boxSizing: 'border-box',
            padding: '50px 36px 40px',
            position: 'relative',
            width: 440,
            height: 440,
            borderRadius: 12,
            boxShadow:
                theme.palette.type === 'dark'
                    ? 'none'
                    : '0px 2px 4px rgba(96, 97, 112, 0.16), 0px 0px 1px rgba(40, 41, 61, 0.04)',
            border: `${theme.palette.type === 'dark' ? 'solid' : 'none'} 1px ${theme.palette.divider}`,
            overflow: 'hidden',
        },
        close: {
            color: theme.palette.text.primary,
            position: 'absolute',
            right: 10,
            top: 10,
        },
        primary: {
            fontSize: 30,
            fontWeight: 500,
            lineHeight: '37px',
        },
        secondary: {
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.75,
            marginTop: 2,
        },
        sandbox: {
            marginTop: 16,
        },
        tip: {
            fontSize: 16,
            lineHeight: 1.75,
        },
        button: {
            fontSize: 16,
            width: 200,
            height: 40,
            marginBottom: 14,
        },
        header: {
            marginBottom: 24,
        },
        content: {},
        footer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            marginTop: 36,
        },
        progress: {
            left: 0,
            right: 0,
            bottom: 0,
            height: 8,
            position: 'absolute',
        },
    }),
)

interface WizardDialogProps {
    title: string
    completion: number
    status: boolean | 'undecided'
    optional?: boolean
    content?: React.ReactNode
    footer?: React.ReactNode
    onClose?: () => void
}

function WizardDialog(props: WizardDialogProps) {
    const { title, optional = false, completion, status, content, footer, onClose } = props
    const classes = useWizardDialogStyles(props)
    const getTheme = () => {
        switch (status) {
            case true:
                return wizardSuccessTheme
            case false:
                return wizardErrorTheme
            default:
                return wizardTheme
        }
    }

    return (
        <ThemeProvider theme={getTheme()}>
            <Paper id="draggable_handle" className={classes.root}>
                <header className={classes.header}>
                    <Typography className={classes.primary} color="textPrimary" variant="h1">
                        {title}
                    </Typography>
                    {optional ? (
                        <Typography className={classes.secondary} color="textSecondary" variant="body2">
                            [Optional]
                        </Typography>
                    ) : null}
                </header>
                <main className={classes.content}>{content}</main>
                <footer className={classes.footer}>{footer}</footer>
                <LinearProgress
                    className={classes.progress}
                    color="secondary"
                    variant="determinate"
                    value={completion}></LinearProgress>
                <CloseIcon className={classes.close} cursor="pointer" onClick={onClose}></CloseIcon>
            </Paper>
        </ThemeProvider>
    )
}
//#endregion

//#region find username
const useFindUsernameStyles = makeStyles((theme) =>
    createStyles({
        input: {
            marginTop: '50px !important',
            marginBottom: 24,
        },
        inputFocus: {
            '& svg': {
                color: theme.palette.primary.main,
            },
        },
        icon: {
            color: theme.palette.text.secondary,
        },
        tip: {},
    }),
)

interface FindUsernameProps extends Partial<WizardDialogProps> {
    username: string
    onNext?: () => void
    onUsernameChange?: (username: string) => void
}

function FindUsername({ username, onNext, onClose, onUsernameChange = noop }: FindUsernameProps) {
    const classes = useWizardDialogStyles()
    const findUsernameClasses = useFindUsernameStyles()
    const [, inputRef] = useCapturedInput(onUsernameChange)

    return (
        <WizardDialog
            completion={50}
            status="undecided"
            title="Find your username"
            content={
                <form>
                    <TextField
                        className={findUsernameClasses.input}
                        variant="outlined"
                        label="Username"
                        value={username}
                        InputProps={{
                            classes: {
                                focused: findUsernameClasses.inputFocus,
                            },
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AlternateEmailIcon className={findUsernameClasses.icon} />
                                </InputAdornment>
                            ),
                        }}
                        inputRef={inputRef}></TextField>
                    <Typography className={classNames(classes.tip, findUsernameClasses.tip)} variant="body2">
                        Maskbook needs the username to connect your Profile to your Persona.
                        <br /> Make sure it is correct.
                    </Typography>
                </form>
            }
            footer={
                <ActionButton
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={onNext}
                    disabled={!username}>
                    Next
                </ActionButton>
            }
            onClose={onClose}></WizardDialog>
    )
}
//#endregion

//#region paste into bio
const usePasteIntoBioStyles = makeStyles((theme) =>
    createStyles({
        input: {
            marginTop: '50px !important',
            marginBottom: 24,
        },
        tip: {
            marginBottom: 16,
        },
        showcaseBoxContent: {
            wordBreak: 'break-all',
        },
        doneButton: {
            color: theme.palette.common.white,
        },
    }),
)

interface PasteIntoBioProps extends Partial<WizardDialogProps> {
    provePost: string
    onCancel?: () => void
}

function PasteIntoBio({ provePost, onClose, onCancel }: PasteIntoBioProps) {
    const { t } = useI18N()
    const classes = useWizardDialogStyles()
    const pasteIntoBioClasses = usePasteIntoBioStyles()
    const ui = getActivatedUI()

    const [pastedStatus, setPastedStatus] = useState<boolean | 'undecided'>('undecided')
    const onConfirm = async () => {
        try {
            await navigator.clipboard.writeText(provePost)
            await sleep(400)
            ui.taskPasteIntoBio(provePost)
            setPastedStatus(true)
        } catch (e) {
            setPastedStatus(false)
        }
    }

    return (
        <WizardDialog
            completion={100}
            status={pastedStatus}
            title="Paste it in your bio"
            optional
            content={
                <form>
                    <Typography className={classNames(classes.tip, pasteIntoBioClasses.tip)} variant="body2">
                        {pastedStatus === false
                            ? t('immersive_setup_paste_into_bio_failed')
                            : "Add the text above in your bio to access advanced features. Please don't delete or change it."}
                    </Typography>
                    <ShowcaseBox ContentProps={{ className: pasteIntoBioClasses.showcaseBoxContent }}>
                        {provePost}
                    </ShowcaseBox>
                </form>
            }
            footer={
                <>
                    <ActionButtonPromise
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        init={t('immersive_setup_paste_into_bio_auto')}
                        waiting={t('adding')}
                        complete={t('done')}
                        failed={t('immersive_setup_paste_into_bio_failed')}
                        executor={onConfirm}
                        completeOnClick={onClose}
                        failedOnClick="use executor">
                        Please add it for me
                    </ActionButtonPromise>
                    <ActionButton variant="text" onClick={onCancel}>
                        Cancel
                    </ActionButton>
                </>
            }
            onClose={onClose}></WizardDialog>
    )
}
//#endregion

//#region setup guide
export interface SetupGuideProps {
    provePost: string
    persona: PersonaIdentifier
    onClose?: () => void
}

export function SetupGuide(props: SetupGuideProps) {
    const { persona, provePost } = props
    const [step, setStep] = useState(SetupGuideStep.FindUsername)
    const ui = getActivatedUI()

    //#region parse setup status
    const lastStateRef = currentImmersiveSetupStatus[ui.networkIdentifier]
    const lastState_ = useValueRef(lastStateRef)
    const lastState = React.useMemo<ImmersiveSetupCrossContextStatus>(() => {
        try {
            return JSON.parse(lastState_)
        } catch {
            return {}
        }
    }, [lastState_])
    useEffect(() => {
        if (step === SetupGuideStep.FindUsername && lastState.username && lastState.status === 'during') {
            setStep(SetupGuideStep.PasteIntoBio)
        }
    }, [step, setStep, lastState])
    //#endregion

    //#region setup username
    const lastRecognized = useValueRef(getActivatedUI().lastRecognizedIdentity)
    const getUsername = () =>
        lastState.username || (lastRecognized.identifier.isUnknown ? '' : lastRecognized.identifier.userId)
    const [username, setUsername] = useState(getUsername)
    //#endregion

    const onNext = async () => {
        currentImmersiveSetupStatus[ui.networkIdentifier].value = JSON.stringify({
            status: 'during',
            username: username,
            persona: persona.toText(),
        } as ImmersiveSetupCrossContextStatus)
        const connecting = new ProfileIdentifier(ui.networkIdentifier, username)
        await Services.Identity.attachProfile(connecting, persona, { connectionConfirmState: 'confirmed' })
        ui.taskGotoProfilePage(connecting)
        await sleep(400)
        setStep(SetupGuideStep.PasteIntoBio)
    }
    const onCancel = async () => {
        const username_ = getUsername()
        currentImmersiveSetupStatus[ui.networkIdentifier].value = JSON.stringify({
            status: 'during',
            // ensure staying find-username page
            username: '',
            persona: persona.toText(),
        } as ImmersiveSetupCrossContextStatus)
        const connected = new ProfileIdentifier(ui.networkIdentifier, username_)
        await Services.Identity.detachProfile(connected)
        setStep(SetupGuideStep.FindUsername)
    }
    const onClose = () => {
        currentImmersiveSetupStatus[ui.networkIdentifier].value = ''
        props.onClose?.()
    }

    switch (step) {
        case SetupGuideStep.FindUsername:
            return (
                <FindUsername
                    username={username}
                    onNext={onNext}
                    onClose={onClose}
                    onUsernameChange={(u) => setUsername(u)}></FindUsername>
            )
        case SetupGuideStep.PasteIntoBio:
            return <PasteIntoBio provePost={provePost} onCancel={onCancel} onClose={onClose}></PasteIntoBio>
        default:
            return null
    }
}
//#endregion
