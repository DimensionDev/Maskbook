import { useMemo, useState, useEffect, useCallback } from 'react'
import { useCopyToClipboard } from 'react-use'
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
    unstable_createMuiStrictModeTheme,
    IconButton,
    Box,
    Hidden,
} from '@material-ui/core'
import classNames from 'classnames'
import { ArrowRight } from 'react-feather'
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail'
import CloseIcon from '@material-ui/icons/Close'
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined'
import stringify from 'json-stable-stringify'
import ActionButton, { ActionButtonPromise } from '../../extension/options-page/DashboardComponents/ActionButton'
import { noop } from 'lodash-es'
import { useI18N } from '../../utils/i18n-next-ui'
import { getActivatedUI } from '../../social-network/ui'
import { currentSetupGuideStatus, SetupGuideCrossContextStatus } from '../../settings/settings'
import { MaskMessage } from '../../utils/messages'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { PersonaIdentifier, ProfileIdentifier, Identifier, ECKeyIdentifier } from '../../database/type'
import Services from '../../extension/service'
import { currentSelectedWalletAddressSettings } from '../../plugins/Wallet/settings'
import { WalletRPC } from '../../plugins/Wallet/messages'

import { useMatchXS } from '../../utils/hooks/useMatchXS'
import { extendsTheme } from '../../utils/theme'

export enum SetupGuideStep {
    FindUsername = 'find-username',
    SayHelloWorld = 'say-hello-world',
}
//#region wizard dialog
const wizardTheme = extendsTheme((theme: Theme) => ({
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                input: {
                    paddingTop: 10.5,
                    paddingBottom: 10.5,
                },
                multiline: {
                    paddingTop: 10.5,
                    paddingBottom: 10.5,
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                outlined: {
                    transform: 'translate(14px, 16px) scale(1)',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                fullWidth: true,
                variant: 'outlined',
                margin: 'normal',
            },
            styleOverrides: {
                root: {
                    marginTop: theme.spacing(2),
                    marginBottom: 0,
                    '&:first-child': {
                        marginTop: 0,
                    },
                },
            },
        },
        MuiButton: {
            defaultProps: {
                size: 'medium',
            },
            styleOverrides: {
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
    },
}))

const useWizardDialogStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: '56px 20px 48px',
            position: 'relative',
            boxShadow: theme.palette.mode === 'dark' ? 'none' : theme.shadows[4],
            border: `${theme.palette.mode === 'dark' ? 'solid' : 'none'} 1px ${theme.palette.divider}`,
            borderRadius: 12,
            [theme.breakpoints.down('sm')]: {
                padding: '35px 20px 16px',
                position: 'fixed',
                bottom: 0,
                left: 0,
                margin: 0,
                alignSelf: 'center',
                borderRadius: 0,
                boxShadow: 'none',
                border: `solid 1px ${theme.palette.divider}`,
                width: '100%',
            },
            userSelect: 'none',
            boxSizing: 'border-box',
            width: 320,
            overflow: 'hidden',
        },
        button: {
            width: 200,
            height: 40,
            marginLeft: 0,
            marginTop: 0,
            [theme.breakpoints.down('sm')]: {
                width: '100%',
                height: '45px !important',
                marginTop: 20,
                borderRadius: 0,
            },
            fontSize: 16,
            wordBreak: 'keep-all',
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
        textButton: {
            fontSize: 14,
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(-2),
        },
        header: {
            marginBottom: 0,
        },
        content: {},
        footer: {},
        progress: {
            left: 0,
            right: 0,
            bottom: 0,
            height: 8,
            position: 'absolute',
        },
        hide: {
            display: 'none',
        },
    }),
)

const useStyles = makeStyles((theme: Theme) => {
    return {
        root: {
            alignItems: 'center',
        },
        content: {
            marginRight: 16,
        },
        footer: {
            marginLeft: 0,
            marginTop: 0,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            marginLeft: 16,
            flex: 1,
        },
        tip: {
            fontSize: 16,
            lineHeight: 1.75,
            marginBottom: 24,
        },
    }
})

interface ContentUIProps {
    dialogType: SetupGuideStep
    content?: React.ReactNode
    footer?: React.ReactNode
    tip?: React.ReactNode
}

function ContentUI(props: ContentUIProps) {
    const classes = useStyles(props)
    const xsMatch = useMatchXS()
    const wizardClasses = useWizardDialogStyles()
    switch (props.dialogType) {
        case SetupGuideStep.FindUsername:
            return (
                <Box
                    sx={{
                        display: 'block',
                    }}>
                    <Box
                        sx={{
                            display: xsMatch ? 'flex' : 'block',
                        }}>
                        <main className={classes.content}>{props.content}</main>
                        <Hidden only="xs">
                            <div>{props.tip}</div>
                        </Hidden>
                        <footer className={classes.footer}>{props.footer}</footer>
                    </Box>
                    <Hidden smUp>
                        <div>{props.tip}</div>
                    </Hidden>
                </Box>
            )

        case SetupGuideStep.SayHelloWorld:
            return (
                <Box>
                    <main className={classes.content}>{props.content}</main>
                    <div>{props.tip}</div>
                    <footer className={classes.footer}>{props.footer}</footer>
                </Box>
            )
        default:
            return null
    }
}

interface WizardDialogProps {
    title: string
    dialogType: SetupGuideStep
    completion: number
    status: boolean | 'undetermined'
    optional?: boolean
    content?: React.ReactNode
    tip?: React.ReactNode
    footer?: React.ReactNode
    onBack?: () => void
    onClose?: () => void
}

function WizardDialog(props: WizardDialogProps) {
    const { t } = useI18N()
    const { title, dialogType, optional = false, completion, status, content, tip, footer, onBack, onClose } = props
    const classes = useWizardDialogStyles(props)

    const isMobile = useMatchXS()

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
                    return unstable_createMuiStrictModeTheme({
                        ...theme,
                        palette: {
                            ...theme.palette,
                            secondary: getSecondaryColor(),
                        },
                    })
                }}>
                <Paper className={classes.root}>
                    <header className={classes.header}>
                        <Typography className={classes.primary} color="textPrimary" variant="h1">
                            {title}
                        </Typography>
                        {optional ? (
                            <Typography className={classes.secondary} color="textSecondary" variant="body2">
                                {t('setup_guide_optional')}
                            </Typography>
                        ) : null}
                    </header>
                    <ContentUI dialogType={dialogType} content={content} tip={tip} footer={footer} />
                    <Hidden only="xs">
                        <LinearProgress
                            className={classes.progress}
                            color="secondary"
                            variant="determinate"
                            value={completion}></LinearProgress>
                    </Hidden>
                    {onBack ? (
                        <IconButton className={classes.back} size="small" onClick={onBack}>
                            <ArrowBackIosOutlinedIcon cursor="pointer" />
                        </IconButton>
                    ) : null}
                    {onClose ? (
                        <IconButton className={classes.close} size="small" onClick={onClose}>
                            <CloseIcon cursor="pointer" />
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
        button: {
            marginLeft: theme.spacing(1),
        },
        icon: {
            color: 'inherit',
        },
    }),
)

interface FindUsernameProps extends Partial<WizardDialogProps> {
    username: string
    onUsernameChange?: (username: string) => void
    onConnect: () => Promise<void>
    onDone?: () => void
}

function FindUsername({ username, onConnect, onDone, onClose, onUsernameChange = noop }: FindUsernameProps) {
    const { t } = useI18N()
    const ui = getActivatedUI()

    const isMobile = useMatchXS()

    const classes = useWizardDialogStyles()
    const findUsernameClasses = useFindUsernameStyles()
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        e.stopPropagation()
        if (e.key !== 'Enter') return
        e.preventDefault()
        onConnect()
    }

    const onJump = useCallback(
        (ev: React.MouseEvent<SVGElement>) => {
            ev.preventDefault()
            ui.taskGotoProfilePage(new ProfileIdentifier(ui.networkIdentifier, username))
        },
        [ui, username],
    )
    return (
        <WizardDialog
            completion={33.33}
            dialogType={SetupGuideStep.FindUsername}
            status="undetermined"
            title={t('setup_guide_find_username_title')}
            content={
                <form>
                    <Box
                        className={findUsernameClasses.input}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                        <TextField
                            label={t('username')}
                            value={username}
                            disabled={!username}
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
                            onChange={(e) => onUsernameChange(e.target.value)}
                            onKeyDown={onKeyDown}
                            inputProps={{ 'data-testid': 'username_input' }}></TextField>
                        <Hidden only="xs">
                            <IconButton
                                className={findUsernameClasses.button}
                                color={username ? 'primary' : 'default'}
                                disabled={!username}>
                                <ArrowRight className={findUsernameClasses.icon} cursor="pinter" onClick={onJump} />
                            </IconButton>
                        </Hidden>
                    </Box>
                </form>
            }
            tip={
                <Typography
                    className={classes.tip}
                    variant="body2"
                    dangerouslySetInnerHTML={{ __html: t('setup_guide_find_username_text') }}></Typography>
            }
            footer={
                <ActionButtonPromise
                    className={classes.button}
                    variant="contained"
                    init={t('setup_guide_connect_auto')}
                    waiting={t('connecting')}
                    complete={t('done')}
                    failed={t('setup_guide_connect_failed')}
                    executor={onConnect}
                    completeOnClick={onDone}
                    disabled={!username}
                    completeIcon={null}
                    failIcon={null}
                    failedOnClick="use executor"
                    data-testid="confirm_button">
                    {t('confirm')}
                </ActionButtonPromise>
            }
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
            dialogType={SetupGuideStep.SayHelloWorld}
            status={createStatus}
            optional
            title={t('setup_guide_say_hello_title')}
            tip={
                <form>
                    <Typography className={classNames(classes.tip, sayHelloWorldClasses.primary)} variant="body2">
                        {t('setup_guide_say_hello_primary')}
                    </Typography>
                    <Typography className={classNames(classes.tip, sayHelloWorldClasses.secondary)} variant="body2">
                        {t('setup_guide_say_hello_secondary')}
                    </Typography>
                </form>
            }
            footer={
                <>
                    <ActionButtonPromise
                        className={classes.button}
                        variant="contained"
                        init={t('setup_guide_create_post_auto')}
                        waiting={t('creating')}
                        complete={t('done')}
                        failed={t('setup_guide_create_post_failed')}
                        executor={onCreate}
                        completeOnClick={onSkip}
                        completeIcon={null}
                        failIcon={null}
                        failedOnClick="use executor"
                        data-testid="create_button"
                    />
                    <Hidden only="xs">
                        <ActionButton
                            className={classes.textButton}
                            color="inherit"
                            variant="text"
                            onClick={onSkip}
                            data-testid="skip_button">
                            {t('skip')}
                        </ActionButton>
                    </Hidden>
                </>
            }
            onBack={onBack}
            onClose={onClose}></WizardDialog>
    )
}
//#endregion

//#region setup guide ui
interface SetupGuideUIProps {
    persona: PersonaIdentifier
    onClose?: () => void
}

function SetupGuideUI(props: SetupGuideUIProps) {
    const { t } = useI18N()
    const { persona } = props
    const [step, setStep] = useState(SetupGuideStep.FindUsername)
    const ui = getActivatedUI()

    //#region parse setup status
    const lastStateRef = currentSetupGuideStatus[ui.networkIdentifier]
    const lastState_ = useValueRef(lastStateRef)
    const lastState = useMemo<SetupGuideCrossContextStatus>(() => {
        try {
            return JSON.parse(lastState_)
        } catch {
            return {}
        }
    }, [lastState_])
    useEffect(() => {
        if (!lastState.status) return
        if (step === SetupGuideStep.FindUsername && lastState.username) setStep(lastState.status)
        else if (step === SetupGuideStep.SayHelloWorld && !lastState.username) setStep(SetupGuideStep.FindUsername)
    }, [step, setStep, lastState])
    //#endregion

    //#region setup username
    const lastRecognized = useValueRef(getActivatedUI().lastRecognizedIdentity)
    const getUsername = () =>
        lastState.username || (lastRecognized.identifier.isUnknown ? '' : lastRecognized.identifier.userId)
    const [username, setUsername] = useState(getUsername)
    useEffect(
        () =>
            getActivatedUI().lastRecognizedIdentity.addListener((val) => {
                if (username === '' && !val.identifier.isUnknown) setUsername(val.identifier.userId)
            }),
        [username],
    )
    //#endregion

    //#region create post status
    const [createStatus, setCreateStatus] = useState<boolean | 'undetermined'>('undetermined')
    //#endregion

    const copyToClipboard = useCopyToClipboard()[1]

    const onNext = async () => {
        switch (step) {
            case SetupGuideStep.FindUsername:
                currentSetupGuideStatus[ui.networkIdentifier].value = stringify({
                    status: SetupGuideStep.SayHelloWorld,
                    username,
                    persona: persona.toText(),
                } as SetupGuideCrossContextStatus)
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
            case SetupGuideStep.SayHelloWorld:
                const username_ = getUsername()
                currentSetupGuideStatus[ui.networkIdentifier].value = stringify({
                    status: SetupGuideStep.FindUsername,
                    username: '', // ensure staying find-username page
                    persona: persona.toText(),
                } as SetupGuideCrossContextStatus)
                const connected = new ProfileIdentifier(ui.networkIdentifier, username_)
                await Services.Identity.detachProfile(connected)
                setStep(SetupGuideStep.FindUsername)
                break
        }
    }
    const onConnect = async () => {
        // attach persona with SNS profile
        await Services.Identity.attachProfile(new ProfileIdentifier(ui.networkIdentifier, username), persona, {
            connectionConfirmState: 'confirmed',
        })

        // auto-finish the setup process
        const persona_ = await Services.Identity.queryPersona(
            Identifier.fromString(persona.toText(), ECKeyIdentifier).unwrap(),
        )
        if (!persona_.hasPrivateKey) throw new Error('invalid persona')
        const [_, address] = await Promise.all([
            Services.Identity.setupPersona(persona_.identifier),
            WalletRPC.importFirstWallet({
                name: persona_.nickname ?? t('untitled_wallet'),
                mnemonic: persona_.mnemonic?.words.split(' '),
                passphrase: '',
            }),
        ])
        if (address) currentSelectedWalletAddressSettings.value = address
        MaskMessage.events.personaChanged.sendToAll([{ of: persona, owned: true, reason: 'new' }])
    }
    const onCreate = async () => {
        const content = t('setup_guide_say_hello_content')
        copyToClipboard(content)
        ui.taskOpenComposeBox(content, {
            shareToEveryOne: true,
        })
    }
    const onClose = () => {
        currentSetupGuideStatus[ui.networkIdentifier].value = ''
        props.onClose?.()
    }

    switch (step) {
        case SetupGuideStep.FindUsername:
            return (
                <FindUsername
                    username={username}
                    onUsernameChange={setUsername}
                    onConnect={onConnect}
                    onDone={onNext}
                    onBack={onBack}
                    onClose={onClose}
                />
            )
        case SetupGuideStep.SayHelloWorld:
            return (
                <SayHelloWorld
                    createStatus={createStatus}
                    onCreate={onCreate}
                    onSkip={onNext}
                    onBack={onBack}
                    onClose={onClose}
                />
            )
        default:
            return null
    }
}
//#endregion

//#region setup guide
const useSetupGuideStyles = makeStyles((theme: Theme) => ({
    root: {
        position: 'fixed',
        zIndex: 9999,
        maxWidth: 550,
        top: '2em',
        right: '2em',
    },
}))
export interface SetupGuideProps extends SetupGuideUIProps {}

export function SetupGuide(props: SetupGuideProps) {
    const classes = useSetupGuideStyles()
    return (
        <div className={classes.root}>
            <SetupGuideUI {...props} />
        </div>
    )
}
//#endregion
