import React, { useMemo, useState, useEffect } from 'react'
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
    createMuiTheme,
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

const useWizardDialogStyles = makeStyles((theme) =>
    createStyles({
        root: {
            boxSizing: 'border-box',
            padding: '48px 20px 0',
            position: 'relative',
            width: 320,
            minHeight: 404,
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
            marginBottom: 24,
        },
        button: {
            fontSize: 16,
            width: 200,
            height: 40,
            marginBottom: 14,
        },
        textButton: {
            fontSize: 16,
        },
        header: {
            marginBottom: 0,
        },
        content: {},
        footer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            marginTop: 16,
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
    const { t } = useI18N()
    const { title, optional = false, completion, status, content, footer, onClose } = props
    const classes = useWizardDialogStyles(props)

    return (
        <ThemeProvider theme={wizardTheme}>
            <ThemeProvider
                theme={(theme: Theme) => {
                    const getSecondaryColor = () => {
                        switch (status) {
                            case true:
                                return theme.palette.success
                            case false:
                                return theme.palette.error
                            default:
                                return theme.palette.warning
                        }
                    }
                    return createMuiTheme({
                        ...theme,
                        palette: {
                            ...theme.palette,
                            secondary: getSecondaryColor(),
                        },
                    })
                }}>
                <Paper id="draggable_handle" className={classes.root}>
                    <header className={classes.header}>
                        <Typography className={classes.primary} color="textPrimary" variant="h1">
                            {title}
                        </Typography>
                        {optional ? (
                            <Typography className={classes.secondary} color="textSecondary" variant="body2">
                                {t('immersive_setup_optional')}
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
        </ThemeProvider>
    )
}
//#endregion

//#region find username
const useFindUsernameStyles = makeStyles((theme) =>
    createStyles({
        input: {
            marginTop: '45px !important',
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
    }),
)

interface FindUsernameProps extends Partial<WizardDialogProps> {
    username: string
    onNext?: () => void
    onUsernameChange?: (username: string) => void
}

function FindUsername({ username, onNext, onClose, onUsernameChange = noop }: FindUsernameProps) {
    const { t } = useI18N()
    const classes = useWizardDialogStyles()
    const findUsernameClasses = useFindUsernameStyles()
    const [binder, inputRef] = useCapturedInput(onUsernameChange, [])

    useEffect(
        () =>
            binder(['keydown'], (e) => {
                e.stopPropagation()
                if (e.key === 'Enter') {
                    e.preventDefault()
                    onNext?.()
                }
            })(),
        [onNext, binder],
    )
    return (
        <WizardDialog
            completion={50}
            status="undecided"
            title={t('immersive_setup_find_username_title')}
            content={
                <form>
                    <TextField
                        className={findUsernameClasses.input}
                        variant="outlined"
                        label={t('username')}
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
                    <Typography
                        className={classes.tip}
                        variant="body2"
                        dangerouslySetInnerHTML={{ __html: t('immersive_setup_find_username_text') }}></Typography>
                </form>
            }
            footer={
                <ActionButton
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={onNext}
                    disabled={!username}>
                    {t('next')}
                </ActionButton>
            }
            onClose={onClose}></WizardDialog>
    )
}
//#endregion

//#region paste into bio
const usePasteIntoBioStyles = makeStyles((theme) =>
    createStyles({
        tip: {
            marginBottom: 8,
        },
        showcaseBoxContent: {
            fontSize: 14,
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
            title={t('immersive_setup_add_bio_title')}
            optional
            content={
                <form>
                    <Typography className={classNames(classes.tip, pasteIntoBioClasses.tip)} variant="body2">
                        {pastedStatus === false
                            ? t('immersive_setup_paste_into_bio_failed')
                            : t('immersive_setup_add_bio_text')}
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
                        completeIcon={null}
                        failIcon={null}
                        failedOnClick="use executor"></ActionButtonPromise>
                    <ActionButton className={classes.textButton} variant="text" onClick={onCancel}>
                        {t('cancel')}
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
    const lastState = useMemo<ImmersiveSetupCrossContextStatus>(() => {
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
