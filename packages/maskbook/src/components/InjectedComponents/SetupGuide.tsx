import { useMemo, useState, useEffect, useCallback } from 'react'
import { useCopyToClipboard } from 'react-use'
import {
    Paper,
    Typography,
    TextField,
    ThemeProvider,
    InputAdornment,
    LinearProgress,
    unstable_createMuiStrictModeTheme,
    IconButton,
    Box,
    useMediaQuery,
    Theme,
} from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { ArrowRight } from 'react-feather'
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail'
import CloseIcon from '@material-ui/icons/Close'
import stringify from 'json-stable-stringify'
import ActionButton, { ActionButtonPromise } from '../../extension/options-page/DashboardComponents/ActionButton'
import { noop } from 'lodash-es'
import { useValueRef } from '@masknet/shared'
import { useI18N, MaskMessage, useMatchXS, extendsTheme } from '../../utils'
import { activatedSocialNetworkUI } from '../../social-network'
import { currentSetupGuideStatus, userGuideStatus } from '../../settings/settings'
import type { SetupGuideCrossContextStatus } from '../../settings/types'
import { PersonaIdentifier, ProfileIdentifier, Identifier, ECKeyIdentifier } from '../../database/type'
import Services from '../../extension/service'

import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { makeTypedMessageText } from '../../protocols/typed-message'

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
                    paddingTop: 8,
                    paddingBottom: 8,
                },
                multiline: {
                    paddingTop: 8,
                    paddingBottom: 8,
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

const useWizardDialogStyles = makeStyles()((theme) => ({
    root: {
        padding: '12px 16px 20px',
        position: 'relative',
        boxShadow: theme.palette.mode === 'dark' ? 'none' : theme.shadows[4],
        border: `${theme.palette.mode === 'dark' ? 'solid' : 'none'} 1px ${theme.palette.divider}`,
        borderRadius: 20,
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
        width: 260,
        overflow: 'hidden',
    },
    button: {
        width: '100%',
        height: 32,
        minHeight: 32,
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
        fontSize: 18,
        fontWeight: 600,
        lineHeight: '30px',
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
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '20px',
        paddingTop: 16,
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
}))

const useStyles = makeStyles()({
    root: {
        alignItems: 'center',
    },
    content: {},
    footer: {
        marginLeft: 0,
        marginTop: 0,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    tip: {},
})

interface ContentUIProps {
    dialogType: SetupGuideStep
    content?: React.ReactNode
    footer?: React.ReactNode
    tip?: React.ReactNode
}

function ContentUI(props: ContentUIProps) {
    const { classes } = useStyles()
    const xsMatch = useMatchXS()
    const onlyXS = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'))
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
                        {onlyXS ? <div>{props.tip}</div> : null}
                        <footer className={classes.footer}>{props.footer}</footer>
                    </Box>
                    {!onlyXS ? <div>{props.tip}</div> : null}
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
    const { classes } = useWizardDialogStyles()
    const onlyXS = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'))

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
                        <Typography className={classes.primary} color="textPrimary" variant="h3">
                            {title}
                        </Typography>
                        {optional ? (
                            <Typography className={classes.secondary} color="textSecondary" variant="body2">
                                {t('setup_guide_optional')}
                            </Typography>
                        ) : null}
                    </header>
                    <ContentUI dialogType={dialogType} content={content} tip={tip} footer={footer} />
                    {onlyXS ? (
                        <LinearProgress
                            className={classes.progress}
                            color="secondary"
                            variant="determinate"
                            value={completion}
                        />
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
const useFindUsernameStyles = makeStyles()((theme) => ({
    input: {
        marginTop: '30px !important',
        marginBottom: 16,
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
        fontSize: 16,
    },
}))

interface FindUsernameProps extends Partial<WizardDialogProps> {
    username: string
    onUsernameChange?: (username: string) => void
    onConnect: () => Promise<void>
    onDone?: () => void
}

function FindUsername({ username, onConnect, onDone, onClose, onUsernameChange = noop }: FindUsernameProps) {
    const { t } = useI18N()
    const ui = activatedSocialNetworkUI
    const gotoProfilePageImpl = ui.automation.redirect?.profilePage

    const { classes } = useWizardDialogStyles()
    const { classes: findUsernameClasses } = useFindUsernameStyles()
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        e.stopPropagation()
        if (e.key !== 'Enter') return
        e.preventDefault()
        onConnect()
    }
    const xsOnly = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'))

    const onJump = useCallback(
        (ev: React.MouseEvent<SVGElement>) => {
            ev.preventDefault()
            gotoProfilePageImpl?.(new ProfileIdentifier(ui.networkIdentifier, username))
        },
        [gotoProfilePageImpl, ui.networkIdentifier, username],
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
                            inputProps={{ 'data-testid': 'username_input' }}
                        />
                        {gotoProfilePageImpl && xsOnly ? (
                            <IconButton
                                size="large"
                                className={findUsernameClasses.button}
                                color={username ? 'primary' : 'default'}
                                disabled={!username}>
                                <ArrowRight className={findUsernameClasses.icon} cursor="pinter" onClick={onJump} />
                            </IconButton>
                        ) : null}
                    </Box>
                </form>
            }
            tip={
                <Typography
                    className={classes.tip}
                    variant="body2"
                    dangerouslySetInnerHTML={{ __html: t('setup_guide_find_username_text') }}
                />
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
                    autoComplete={userGuideStatus[ui.networkIdentifier].value !== 'completed'}
                    disabled={!username}
                    completeIcon={null}
                    failIcon={null}
                    failedOnClick="use executor"
                    data-testid="confirm_button">
                    {t('confirm')}
                </ActionButtonPromise>
            }
            onClose={onClose}
        />
    )
}
//#endregion

//#region say hello world
const useSayHelloWorldStyles = makeStyles()((theme) => ({
    primary: {
        marginTop: 24,
        marginBottom: 16,
    },
    secondary: {
        color: theme.palette.text.secondary,
        fontSize: 14,
    },
}))

interface SayHelloWorldProps extends Partial<WizardDialogProps> {
    createStatus: boolean | 'undetermined'
    onSkip?: () => void
    onCreate: () => Promise<void>
}

function SayHelloWorld({ createStatus, onCreate, onSkip, onBack, onClose }: SayHelloWorldProps) {
    const { t } = useI18N()
    const { classes } = useWizardDialogStyles()
    const { classes: sayHelloWorldClasses } = useSayHelloWorldStyles()
    const xsOnly = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'))

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
                    <Typography
                        className={classNames(classes.tip, sayHelloWorldClasses.secondary)}
                        variant="body2"
                        sx={{ paddingBottom: '16px' }}>
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
                    {xsOnly ? (
                        <ActionButton
                            className={classes.textButton}
                            color="inherit"
                            variant="text"
                            onClick={onSkip}
                            data-testid="skip_button">
                            {t('skip')}
                        </ActionButton>
                    ) : null}
                </>
            }
            onBack={onBack}
            onClose={onClose}
        />
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
    const ui = activatedSocialNetworkUI

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
    const lastRecognized = useLastRecognizedIdentity()
    const getUsername = () =>
        lastState.username || (lastRecognized.identifier.isUnknown ? '' : lastRecognized.identifier.userId)
    const [username, setUsername] = useState(getUsername)
    useEffect(
        () =>
            activatedSocialNetworkUI.collecting.identityProvider?.recognized.addListener((val) => {
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
                if (userGuideStatus[ui.networkIdentifier].value !== 'completed') {
                    onClose()
                    currentSetupGuideStatus[ui.networkIdentifier].value = '1'
                    userGuideStatus[ui.networkIdentifier].value = username
                } else {
                    currentSetupGuideStatus[ui.networkIdentifier].value = stringify({
                        status: SetupGuideStep.SayHelloWorld,
                        username,
                        persona: persona.toText(),
                    } as SetupGuideCrossContextStatus)
                    if (activatedSocialNetworkUI.configuration.setupWizard?.disableSayHello) {
                        onConnect().then(onClose)
                    } else {
                        ui.automation.redirect?.newsFeed?.()
                        setStep(SetupGuideStep.SayHelloWorld)
                    }
                }
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
        await Services.Identity.setupPersona(persona_.identifier)
        MaskMessage.events.ownPersonaChanged.sendToAll(undefined)
    }
    const onCreate = async () => {
        const content = t('setup_guide_say_hello_content')
        copyToClipboard(content)
        ui.automation.maskCompositionDialog?.open?.(makeTypedMessageText(content), {
            target: 'Everyone',
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
const useSetupGuideStyles = makeStyles()({
    root: {
        position: 'fixed',
        zIndex: 9999,
        maxWidth: 550,
        top: '2em',
        right: '2em',
    },
})
export interface SetupGuideProps extends SetupGuideUIProps {}

export function SetupGuide(props: SetupGuideProps) {
    const { classes } = useSetupGuideStyles()
    return (
        <div className={classes.root}>
            <SetupGuideUI {...props} />
        </div>
    )
}
//#endregion
