import { useMemo, useState, useEffect } from 'react'
import { Paper, Typography, ThemeProvider, IconButton, Box, Theme } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import CloseIcon from '@mui/icons-material/Close'
import { ActionButtonPromise } from '../../extension/options-page/DashboardComponents/ActionButton'
import { useValueRef } from '@masknet/shared'
import { useI18N, MaskMessages, extendsTheme } from '../../utils'
import { activatedSocialNetworkUI } from '../../social-network'
import { currentSetupGuideStatus } from '../../settings/settings'
import type { SetupGuideCrossContextStatus } from '../../settings/types'
import { PersonaIdentifier, ProfileIdentifier, Identifier, ECKeyIdentifier } from '@masknet/shared-base'
import Services from '../../extension/service'

import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { MaskIcon } from '../../resources/MaskIcon'
import { useAsync, useCopyToClipboard } from 'react-use'
import classNames from 'classnames'
import VerifiedIcon from '@mui/icons-material/Verified'
import { makeTypedMessageText } from '@masknet/shared-base'

export enum SetupGuideStep {
    FindUsername = 'find-username',
    Close = 'close',
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
        padding: theme.spacing(3),
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
        width: 480,
        overflow: 'hidden',
    },
    button: {
        width: 150,
        height: 40,
        minHeight: 40,
        marginLeft: 0,
        marginTop: 0,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            height: '45px !important',
            marginTop: 20,
            borderRadius: 0,
        },
        fontSize: 14,
        wordBreak: 'keep-all',
        '&,&:hover': {
            color: `${MaskColorVar.twitterButtonText} !important`,
            background: `${MaskColorVar.twitterButton} !important`,
        },
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
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '22px',
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
        marginTop: 24,
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
    switch (props.dialogType) {
        case SetupGuideStep.FindUsername:
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
    completion?: number
    status: boolean | 'undetermined'
    optional?: boolean
    content?: React.ReactNode
    tip?: React.ReactNode
    footer?: React.ReactNode
    onBack?: () => void
    onClose?: () => void
}

function WizardDialog(props: WizardDialogProps) {
    const { title, dialogType, status, content, tip, footer, onBack, onClose } = props
    const { classes } = useWizardDialogStyles()

    return (
        <ThemeProvider theme={wizardTheme}>
            <Paper className={classes.root}>
                <header className={classes.header}>
                    <Typography className={classes.primary} color="textPrimary" variant="h3">
                        {title}
                    </Typography>
                </header>
                <ContentUI dialogType={dialogType} content={content} tip={tip} footer={footer} />
                {onClose ? (
                    <IconButton className={classes.close} size="medium" onClick={onClose}>
                        <CloseIcon cursor="pointer" />
                    </IconButton>
                ) : null}
            </Paper>
        </ThemeProvider>
    )
}
//#endregion

//#region find username
const useFindUsernameStyles = makeStyles()((theme) => ({
    main: {
        marginTop: theme.spacing(5),
        marginBottom: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    avatar: {
        display: 'block',
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: `solid 1px ${MaskColorVar.border}`,
        '&.connected': {
            borderColor: MaskColorVar.success,
        },
    },
    verified: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        fontSize: 16,
        color: MaskColorVar.success,
    },
    connectItem: {
        height: 75,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    line: {
        width: 100,
        height: 1,
        borderTop: `dashed 1px  ${MaskColorVar.borderSecondary}`,
    },
    name: {
        fontSize: 16,
        fontWeight: 500,
    },
}))

interface FindUsernameProps extends Partial<WizardDialogProps> {
    username: string
    personaName?: string
    avatar?: string
    onUsernameChange?: (username: string) => void
    onConnect: () => Promise<void>
    onDone?: () => void
}

function FindUsername({ personaName, username, avatar, onConnect, onDone, onClose }: FindUsernameProps) {
    const { t } = useI18N()
    const [connected, setConnected] = useState(false)

    const { classes } = useWizardDialogStyles()
    const { classes: findUsernameClasses } = useFindUsernameStyles()

    return (
        <WizardDialog
            completion={33.33}
            dialogType={SetupGuideStep.FindUsername}
            status="undetermined"
            title=""
            content={
                <Box className={findUsernameClasses.main}>
                    <Box className={findUsernameClasses.connectItem}>
                        <MaskIcon size={48} />
                        <Typography variant="body2" className={findUsernameClasses.name}>
                            {personaName}
                        </Typography>
                    </Box>
                    <Box className={findUsernameClasses.line} />
                    <Box className={findUsernameClasses.connectItem}>
                        <Box position="relative" width={48}>
                            <img
                                src={avatar}
                                className={classNames(findUsernameClasses.avatar, connected ? 'connected' : '')}
                            />
                            {connected ? <VerifiedIcon className={findUsernameClasses.verified} /> : null}
                        </Box>
                        <Typography variant="body2" className={findUsernameClasses.name}>
                            {username}
                        </Typography>
                    </Box>
                </Box>
            }
            tip={
                <Typography
                    className={classes.tip}
                    variant="body2"
                    dangerouslySetInnerHTML={{
                        __html: connected ? t('user_guide_tip_connected') : t('setup_guide_find_username_text'),
                    }}
                />
            }
            footer={
                <ActionButtonPromise
                    className={classes.button}
                    variant="contained"
                    init={t('setup_guide_connect_auto')}
                    waiting={t('connecting')}
                    complete={t('ok')}
                    failed={t('setup_guide_connect_failed')}
                    executor={onConnect}
                    completeOnClick={onDone}
                    onComplete={() => setConnected(true)}
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

//#region setup guide ui
interface SetupGuideUIProps {
    persona: PersonaIdentifier
    onClose?: () => void
}

function SetupGuideUI(props: SetupGuideUIProps) {
    const { t } = useI18N()
    const { persona } = props
    const ui = activatedSocialNetworkUI
    const [, copyToClipboard] = useCopyToClipboard()
    const [step, setStep] = useState(SetupGuideStep.FindUsername)

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
        setStep(lastState.status ?? SetupGuideStep.Close)
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

    const { value: persona_ } = useAsync(async () => {
        return Services.Identity.queryPersona(Identifier.fromString(persona.toText(), ECKeyIdentifier).unwrap())
    }, [persona])

    const onConnect = async () => {
        // attach persona with SNS profile
        await Services.Identity.attachProfile(new ProfileIdentifier(ui.networkIdentifier, username), persona, {
            connectionConfirmState: 'confirmed',
        })

        // auto-finish the setup process
        if (!persona_?.hasPrivateKey) throw new Error('invalid persona')
        await Services.Identity.setupPersona(persona_?.identifier)
        MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
    }

    const onClose = () => {
        currentSetupGuideStatus[ui.networkIdentifier].value = ''
    }

    const onDone = () => {
        // check user guide status

        onClose()
        onCreate()
    }

    const onCreate = async () => {
        const content = t('setup_guide_say_hello_content')
        copyToClipboard(content)
        ui.automation.maskCompositionDialog?.open?.(makeTypedMessageText(content), {
            target: 'Everyone',
        })
    }

    return step === SetupGuideStep.FindUsername ? (
        <FindUsername
            personaName={persona_?.nickname}
            username={username}
            avatar={lastRecognized.avatar}
            onUsernameChange={setUsername}
            onConnect={onConnect}
            onDone={onDone}
            onClose={onClose}
        />
    ) : null
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
