import { useMemo, useState, useEffect } from 'react'
import { Paper, Typography, IconButton, Box, Button, FormControlLabel, Checkbox } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import CloseIcon from '@mui/icons-material/Close'
import { ActionButtonPromise } from '../../extension/options-page/DashboardComponents/ActionButton'
import { useValueRef } from '@masknet/shared'
import { useI18N, MaskMessages } from '../../utils'
import { activatedSocialNetworkUI, SocialNetworkUI } from '../../social-network'
import { currentSetupGuideStatus, dismissPinExtensionTip, userGuideStatus } from '../../settings/settings'
import type { SetupGuideCrossContextStatus } from '../../settings/types'
import {
    PersonaIdentifier,
    ProfileIdentifier,
    Identifier,
    ECKeyIdentifier,
    makeTypedMessageText,
} from '@masknet/shared-base'
import Services from '../../extension/service'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { MaskIcon } from '../../resources/MaskIcon'
import { useAsync, useCopyToClipboard } from 'react-use'
import classNames from 'classnames'
import ExtensionIcon from '@mui/icons-material/Extension'
import stringify from 'json-stable-stringify'
import { VerifiedIcon, PinIcon } from '@masknet/icons'

export enum SetupGuideStep {
    FindUsername = 'find-username',
    PinExtension = 'pin-extension',
    Close = 'close',
}

// #region wizard dialog
const useWizardDialogStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(3),
        position: 'relative',
        boxShadow: theme.palette.mode === 'dark' ? 'none' : theme.shadows[4],
        border: `${theme.palette.mode === 'dark' ? 'solid' : 'none'} 1px ${theme.palette.divider}`,
        borderRadius: 20,
        [theme.breakpoints.down('sm')]: {
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
        '&.small': {
            width: 384,
        },
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
        },
        fontSize: 14,
        wordBreak: 'keep-all',
        '&,&:hover': {
            color: `${MaskColorVar.twitterButtonText} !important`,
            background: `${MaskColorVar.twitterButton} !important`,
        },
    },
    close: {
        color: theme.palette.text.primary,
        position: 'absolute',
        right: 10,
        top: 10,
    },
    tip: {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '22px',
        paddingTop: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: '22px',
    },
    header: {
        height: 40,
    },
    content: {},
    connection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    connectItem: {
        flex: 1,
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
    footer: {},
}))

const useStyles = makeStyles()((theme) => ({
    content: {
        marginBottom: theme.spacing(2),
    },
    footer: {
        marginLeft: 0,
        marginTop: theme.spacing(3),
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    tip: {},
}))

interface ContentUIProps {
    dialogType: SetupGuideStep
    content?: React.ReactNode
    footer?: React.ReactNode
    tip?: React.ReactNode
    dismiss?: React.ReactNode
}

function ContentUI(props: ContentUIProps) {
    const { classes } = useStyles()
    switch (props.dialogType) {
        case SetupGuideStep.FindUsername:
        case SetupGuideStep.PinExtension:
            return (
                <Box>
                    <main className={classes.content}>{props.content}</main>
                    <div>{props.tip}</div>
                    {props.footer ? <footer className={classes.footer}>{props.footer}</footer> : null}
                    {props.dismiss ? <div>{props.dismiss}</div> : null}
                </Box>
            )
        default:
            return null
    }
}

interface WizardDialogProps {
    small?: boolean
    title?: string
    dialogType: SetupGuideStep
    optional?: boolean
    content?: React.ReactNode
    tip?: React.ReactNode
    footer?: React.ReactNode
    dismiss?: React.ReactNode
    onClose?: () => void
}

function WizardDialog(props: WizardDialogProps) {
    const { small, title, dialogType, content, tip, footer, dismiss, onClose } = props
    const { classes } = useWizardDialogStyles()

    return (
        <Paper className={classNames(classes.root, small ? 'small' : '')}>
            <header className={classes.header}>
                <Typography color="textPrimary" variant="h3" fontSize={24}>
                    {title}
                </Typography>
            </header>
            <ContentUI dialogType={dialogType} content={content} tip={tip} footer={footer} dismiss={dismiss} />
            {onClose ? (
                <IconButton className={classes.close} size="medium" onClick={onClose}>
                    <CloseIcon cursor="pointer" />
                </IconButton>
            ) : null}
        </Paper>
    )
}
// #endregion

// #region find username
const useFindUsernameStyles = makeStyles()((theme) => ({
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
            dialogType={SetupGuideStep.FindUsername}
            small={!username}
            content={
                <Box className={classes.connection}>
                    <Box className={classes.connectItem}>
                        <MaskIcon size={48} />
                        <Typography variant="body2" className={classes.name}>
                            {personaName}
                        </Typography>
                    </Box>
                    {username ? (
                        <>
                            <Box className={classes.line} />
                            <Box className={classes.connectItem}>
                                <Box position="relative" width={48}>
                                    <img
                                        src={avatar}
                                        className={classNames(findUsernameClasses.avatar, connected ? 'connected' : '')}
                                    />
                                    {connected ? <VerifiedIcon className={findUsernameClasses.verified} /> : null}
                                </Box>
                                <Typography variant="body2" className={classes.name}>
                                    {username}
                                </Typography>
                            </Box>
                        </>
                    ) : null}
                </Box>
            }
            tip={
                <Typography
                    className={classes.tip}
                    variant="body2"
                    dangerouslySetInnerHTML={{
                        __html: !username
                            ? t('setup_guide_login')
                            : connected
                            ? t('user_guide_tip_connected')
                            : t('setup_guide_find_username_text'),
                    }}
                />
            }
            footer={
                username ? (
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
                        disabled={!username || !personaName}
                        completeIcon={null}
                        failIcon={null}
                        failedOnClick="use executor"
                        data-testid="confirm_button">
                        {t('confirm')}
                    </ActionButtonPromise>
                ) : null
            }
            onClose={onClose}
        />
    )
}
// #endregion

interface PinExtensionProps {
    onDone?: () => void
}
function PinExtension({ onDone }: PinExtensionProps) {
    const pinImg = new URL('../../resources/extensionPinned.png', import.meta.url).toString()
    const { classes } = useWizardDialogStyles()
    const { t } = useI18N()
    const [checked, setChecked] = useState(true)

    return (
        <WizardDialog
            dialogType={SetupGuideStep.PinExtension}
            content={
                <Box className={classes.connection}>
                    <Box className={classes.connectItem}>
                        <MaskIcon size={48} />
                        <Typography variant="body2" className={classes.name}>
                            Mask Network
                        </Typography>
                    </Box>
                    <Box className={classes.line} />
                    <Box className={classes.connectItem}>
                        <img
                            src={pinImg}
                            width={100}
                            style={{ filter: 'drop-shadow(0px 0px 16px rgba(101, 119, 134, 0.2))' }}
                        />
                    </Box>
                </Box>
            }
            tip={
                <Typography className={classes.tip} component="div">
                    <div>{t('setup_guide_pin_tip_0')}</div>
                    <ol style={{ paddingLeft: '24px' }}>
                        <li>
                            {t('setup_guide_pin_tip_1')}
                            <ExtensionIcon sx={{ fontSize: 16, color: '#ababab' }} />
                            {t('setup_guide_pin_tip_1_s')}
                        </li>
                        <li>
                            {t('setup_guide_pin_tip_2')}
                            <PinIcon sx={{ fontSize: 16 }} />
                            {t('setup_guide_pin_tip_2_s')}
                        </li>
                        <li>{t('setup_guide_pin_tip_3')}</li>
                    </ol>
                </Typography>
            }
            footer={
                <Button className={classes.button} variant="contained" onClick={onDone}>
                    {t('start')}
                </Button>
            }
            dismiss={
                <FormControlLabel
                    classes={{ label: classes.label }}
                    control={
                        <Checkbox
                            checked={checked}
                            onChange={(e) => {
                                setChecked(e.target.checked)
                                dismissPinExtensionTip.value = e.target.checked
                            }}
                        />
                    }
                    label={t('setup_guide_pin_dismiss')}
                />
            }
            onClose={onDone}
        />
    )
}

// #region setup guide ui
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

    // #region parse setup status
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
    }, [lastState])
    // #endregion

    // #region setup username
    const lastRecognized = useLastRecognizedIdentity()
    const getUsername = () =>
        lastState.username || (lastRecognized.identifier.isUnknown ? '' : lastRecognized.identifier.userId)
    const [username, setUsername] = useState(getUsername)

    useEffect(() => {
        const handler = (val: SocialNetworkUI.CollectingCapabilities.IdentityResolved) => {
            if (username === '' && !val.identifier.isUnknown) setUsername(val.identifier.userId)
        }
        activatedSocialNetworkUI.collecting.identityProvider?.recognized.addListener(handler)

        return () => {
            activatedSocialNetworkUI.collecting.identityProvider?.recognized.removeListener(handler)
        }
    }, [username])

    useEffect(() => {
        if (username || ui.networkIdentifier !== 'twitter.com') return
        // In order to collect user info after login, need to reload twitter once
        let reloaded = false
        const handler = () => {
            // twitter will redirect to home page after login
            if (!(!reloaded && location.pathname === '/home')) return
            reloaded = true
            location.reload()
        }
        window.addEventListener('locationchange', handler)
        return () => {
            window.removeEventListener('locationchange', handler)
        }
    }, [username])
    // #endregion

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
        setStep(SetupGuideStep.Close)
    }

    const onDone = () => {
        // check pin tip status
        if (step === SetupGuideStep.FindUsername && !dismissPinExtensionTip.value) {
            currentSetupGuideStatus[ui.networkIdentifier].value = stringify({ status: SetupGuideStep.PinExtension })
            return setStep(SetupGuideStep.PinExtension)
        }
        // check user guide status
        const network = ui.networkIdentifier
        if (network === 'twitter.com' && userGuideStatus[network].value !== 'completed') {
            userGuideStatus[network].value = '1'
        } else {
            onCreate()
        }

        onClose()
    }

    const onCreate = async () => {
        let content = t('setup_guide_say_hello_content')
        if (ui.networkIdentifier === 'twitter.com') {
            content += t('setup_guide_say_hello_follow', { account: '@realMaskNetwork' })
        } else if (ui.networkIdentifier === 'facebook.com') {
            content += t('setup_guide_say_hello_follow', { account: '@masknetwork' })
        }

        ui.automation.maskCompositionDialog?.open?.(makeTypedMessageText(content), {
            target: 'Everyone',
        })
    }

    switch (step) {
        case SetupGuideStep.FindUsername:
            return (
                <FindUsername
                    personaName={persona_?.nickname}
                    username={username}
                    avatar={lastRecognized.avatar}
                    onUsernameChange={setUsername}
                    onConnect={onConnect}
                    onDone={onDone}
                    onClose={onClose}
                />
            )
        case SetupGuideStep.PinExtension:
            return <PinExtension onDone={onDone} />
        default:
            return null
    }
}
// #endregion

// #region setup guide
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
// #endregion
