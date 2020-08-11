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
    IconButton,
} from '@material-ui/core'
import classNames from 'classnames'
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail'
import CloseIcon from '@material-ui/icons/Close'
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined'
import stringify from 'json-stable-stringify'
import ActionButton, { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import ShowcaseBox from '../../../extension/options-page/DashboardComponents/ShowcaseBox'
import { merge, cloneDeep, noop } from 'lodash-es'
import { useI18N } from '../../../utils/i18n-next-ui'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { getActivatedUI } from '../../../social-network/ui'
import { currentImmersiveSetupStatus, ImmersiveSetupCrossContextStatus } from '../../../settings/settings'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { useCapturedInput } from '../../../utils/hooks/useCapturedEvents'
import { PersonaIdentifier, ProfileIdentifier, Identifier, ECKeyIdentifier } from '../../../database/type'
import Services from '../../../extension/service'
import { MessageCenter } from '../../../utils/messages'

export enum SetupGuideStep {
    FindUsername = 'find-username',
    PasteIntoBio = 'paste-into-bio',
    SayHelloWorld = 'say-hello-world',
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
            userSelect: 'none',
            boxSizing: 'border-box',
            padding: '56px 20px 48px',
            position: 'relative',
            width: 320,
            minHeight: 404,
            borderRadius: 12,
            boxShadow: theme.palette.type === 'dark' ? 'none' : theme.shadows[4],
            border: `${theme.palette.type === 'dark' ? 'solid' : 'none'} 1px ${theme.palette.divider}`,
            overflow: 'hidden',
        },
        back: {
            color: theme.palette.text.primary,
            position: 'absolute',
            left: 10,
            top: 10,
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
            wordBreak: 'keep-all',
        },
        textButton: {
            fontSize: 14,
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(-2),
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
    status: boolean | 'undetermined'
    optional?: boolean
    content?: React.ReactNode
    footer?: React.ReactNode
    onBack?: () => void
    onClose?: () => void
}

function WizardDialog(props: WizardDialogProps) {
    const { t } = useI18N()
    const { title, optional = false, completion, status, content, footer, onBack, onClose } = props
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
                    {onBack ? (
                        <IconButton className={classes.back} size="small">
                            <ArrowBackIosOutlinedIcon cursor="pointer" onClick={onBack}></ArrowBackIosOutlinedIcon>
                        </IconButton>
                    ) : null}
                    {onClose ? (
                        <IconButton className={classes.close} size="small">
                            <CloseIcon cursor="pointer" onClick={onClose}></CloseIcon>
                        </IconButton>
                    ) : null}
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
    onConfirm?: () => void
    onUsernameChange?: (username: string) => void
}

function FindUsername({ username, onConfirm, onClose, onUsernameChange = noop }: FindUsernameProps) {
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
                    onConfirm?.()
                }
            })(),
        [onConfirm, binder],
    )
    return (
        <WizardDialog
            completion={33.33}
            status="undetermined"
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
                        inputRef={inputRef}
                        inputProps={{ 'data-testid': 'username_input' }}></TextField>
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
                    onClick={onConfirm}
                    disabled={!username}
                    data-testid="confirm_button">
                    {t('confirm')}
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
    pastedStatus: boolean | 'undetermined'
    onPaste: () => Promise<void>
    onDone?: () => Promise<void>
    onSkip?: () => void
}

function PasteIntoBio({ provePost, pastedStatus, onPaste, onDone, onSkip, onBack, onClose }: PasteIntoBioProps) {
    const { t } = useI18N()
    const classes = useWizardDialogStyles()
    const pasteIntoBioClasses = usePasteIntoBioStyles()

    return (
        <WizardDialog
            completion={66.66}
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
                    <ShowcaseBox
                        ContentProps={{
                            className: pasteIntoBioClasses.showcaseBoxContent,
                        }}>
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
                        executor={onPaste}
                        completeOnClick={onDone}
                        completeIcon={null}
                        failIcon={null}
                        failedOnClick="use executor"
                        data-testid="add_button"
                    />
                    <ActionButton
                        className={classes.textButton}
                        variant="text"
                        onClick={onSkip}
                        data-testid="skip_button">
                        {t('skip')}
                    </ActionButton>
                </>
            }
            onBack={onBack}
            onClose={onClose}></WizardDialog>
    )
}
//#endregion

//#region say hello world
const useSayHelloWorldStyles = makeStyles((theme) =>
    createStyles({
        primary: {
            marginTop: 24,
            marginBottom: 16,
        },
        secondary: {
            color: theme.palette.text.secondary,
            fontSize: 14,
        },
    }),
)

interface SayHelloWorldProps extends Partial<WizardDialogProps> {
    createStatus: boolean | 'undetermined'
    onSkip?: () => void
    onCreate: () => Promise<void>
}

function SayHelloWorld({ createStatus, onCreate, onSkip, onBack, onClose }: SayHelloWorldProps) {
    const { t } = useI18N()
    const classes = useWizardDialogStyles()
    const sayHelloWorldClasses = useSayHelloWorldStyles()
    return (
        <WizardDialog
            completion={100}
            status={createStatus}
            optional
            title={t('immersive_setup_say_hello_title')}
            content={
                <form>
                    <Typography className={classNames(classes.tip, sayHelloWorldClasses.primary)} variant="body2">
                        {t('immersive_setup_say_hello_primary')}
                    </Typography>
                    <Typography className={classNames(classes.tip, sayHelloWorldClasses.secondary)} variant="body2">
                        {t('immersive_setup_say_hello_secondary')}
                    </Typography>
                </form>
            }
            footer={
                <>
                    <ActionButtonPromise
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        init={t('immersive_setup_create_post_auto')}
                        waiting={t('creating')}
                        complete={t('done')}
                        failed={t('immersive_setup_create_post_failed')}
                        executor={onCreate}
                        completeOnClick={onSkip}
                        completeIcon={null}
                        failIcon={null}
                        failedOnClick="use executor"
                        data-testid="create_button"
                    />
                    <ActionButton
                        className={classes.textButton}
                        variant="text"
                        onClick={onSkip}
                        data-testid="skip_button">
                        {t('skip')}
                    </ActionButton>
                </>
            }
            onBack={onBack}
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
    const { t } = useI18N()
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
        if (!lastState.status) return
        if (step === SetupGuideStep.FindUsername && lastState.username) setStep(lastState.status)
        else if (step === SetupGuideStep.PasteIntoBio && !lastState.username) setStep(SetupGuideStep.FindUsername)
        else if (step === SetupGuideStep.SayHelloWorld && !lastState.username) setStep(SetupGuideStep.FindUsername)
    }, [step, setStep, lastState])
    //#endregion

    //#region setup username
    const lastRecognized = useValueRef(getActivatedUI().lastRecognizedIdentity)
    const getUsername = () =>
        lastState.username || (lastRecognized.identifier.isUnknown ? '' : lastRecognized.identifier.userId)
    const [username, setUsername] = useState(getUsername)
    //#endregion

    //#region paste status
    const [pastedStatus, setPastedStatus] = useState<boolean | 'undetermined'>('undetermined')
    //#ednregion

    //#region create post status
    const [createStatus, setCreateStatus] = useState<boolean | 'undetermined'>('undetermined')
    //#endregion

    const onNext = async () => {
        switch (step) {
            case SetupGuideStep.FindUsername:
                currentImmersiveSetupStatus[ui.networkIdentifier].value = stringify({
                    status: SetupGuideStep.PasteIntoBio,
                    username,
                    persona: persona.toText(),
                } as ImmersiveSetupCrossContextStatus)
                const connecting = new ProfileIdentifier(ui.networkIdentifier, username)
                await Services.Identity.attachProfile(connecting, persona, { connectionConfirmState: 'confirmed' })
                ui.taskGotoProfilePage(connecting)
                setStep(SetupGuideStep.PasteIntoBio)
                break
            case SetupGuideStep.PasteIntoBio:
                currentImmersiveSetupStatus[ui.networkIdentifier].value = stringify({
                    status: SetupGuideStep.SayHelloWorld,
                    username,
                    persona: persona.toText(),
                } as ImmersiveSetupCrossContextStatus)
                ui.taskGotoNewsFeedPage()
                setStep(SetupGuideStep.SayHelloWorld)
                break
            case SetupGuideStep.SayHelloWorld:
                onClose()
                break
        }
    }
    const onBack = async () => {
        switch (step) {
            case SetupGuideStep.PasteIntoBio:
                const username_ = getUsername()
                currentImmersiveSetupStatus[ui.networkIdentifier].value = stringify({
                    status: SetupGuideStep.FindUsername,
                    username: '', // ensure staying find-username page
                    persona: persona.toText(),
                } as ImmersiveSetupCrossContextStatus)
                const connected = new ProfileIdentifier(ui.networkIdentifier, username_)
                await Services.Identity.detachProfile(connected)
                setStep(SetupGuideStep.FindUsername)
                break
            case SetupGuideStep.SayHelloWorld:
                currentImmersiveSetupStatus[ui.networkIdentifier].value = stringify({
                    ...lastState,
                    status: SetupGuideStep.PasteIntoBio,
                } as ImmersiveSetupCrossContextStatus)
                const connecting = new ProfileIdentifier(ui.networkIdentifier, username)
                ui.taskGotoProfilePage(connecting)
                setStep(SetupGuideStep.PasteIntoBio)
                break
        }
    }
    const onPaste = async () => {
        try {
            await navigator.clipboard.writeText(provePost)
            ui.taskPasteIntoBio(provePost)
            setPastedStatus(true)
        } catch (e) {
            setPastedStatus(false)
        }
    }
    const onCreate = async () => {
        if (!lastState.persona) return
        const persona = await Services.Identity.queryPersona(
            Identifier.fromString(lastState.persona, ECKeyIdentifier).unwrap(),
        )
        if (!persona) return

        // auto-finish the setup process
        await Promise.all([
            Services.Identity.setupPersona(persona.identifier),
            Services.Plugin.invokePlugin('maskbook.wallet', 'importFirstWallet', {
                name: persona.nickname ?? t('untitled_wallet'),
                mnemonic: persona.mnemonic?.words.split(' '),
                passphrase: '',
                _wallet_is_default: true,
            }),
        ])

        // open compose dialog
        const content = t('immersive_setup_say_hello_content')
        await navigator.clipboard.writeText(content)
        ui.taskOpenComposeBox(content, {
            shareToEveryOne: true,
        })
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
                    onConfirm={onNext}
                    onBack={onBack}
                    onClose={onClose}
                    onUsernameChange={setUsername}></FindUsername>
            )
        case SetupGuideStep.PasteIntoBio:
            return (
                <PasteIntoBio
                    provePost={provePost}
                    pastedStatus={pastedStatus}
                    onPaste={onPaste}
                    onDone={onNext}
                    onSkip={onNext}
                    onBack={onBack}
                    onClose={onClose}></PasteIntoBio>
            )
        case SetupGuideStep.SayHelloWorld:
            return (
                <SayHelloWorld
                    createStatus={createStatus}
                    onCreate={onCreate}
                    onSkip={onNext}
                    onBack={onBack}
                    onClose={onClose}></SayHelloWorld>
            )
        default:
            return null
    }
}
//#endregion
