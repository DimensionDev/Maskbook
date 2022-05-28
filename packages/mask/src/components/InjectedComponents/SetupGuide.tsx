import { useMemo, useState, useEffect, useRef } from 'react'
import { makeStyles } from '@masknet/theme'
import { useValueRef } from '@masknet/shared-base-ui'
import { useI18N, MaskMessages } from '../../utils'
import { activatedSocialNetworkUI } from '../../social-network'
import {
    currentSetupGuideStatus,
    languageSettings,
    userGuideStatus,
    userGuideVersion,
    userPinExtension,
} from '../../settings/settings'
import type { SetupGuideCrossContextStatus } from '../../settings/types'
import { makeTypedMessageText } from '@masknet/typed-message'
import {
    PersonaIdentifier,
    ProfileIdentifier,
    NextIDPlatform,
    toBase64,
    fromHex,
    NextIDAction,
    EnhanceableSite,
    CrossIsolationMessages,
    EncryptionTargetType,
} from '@masknet/shared-base'
import Services from '../../extension/service'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { useAsync } from 'react-use'
import stringify from 'json-stable-stringify'
import type { NextIDPayload } from '@masknet/shared-base'
import { SetupGuideStep } from './SetupGuide/types'
import { FindUsername } from './SetupGuide/FindUsername'
import { VerifyNextID } from './SetupGuide/VerifyNextID'
import { PinExtension } from './SetupGuide/PinExtension'
import type { IdentityResolved } from '@masknet/plugin-infra'

// #region setup guide ui
interface SetupGuideUIProps {
    persona: PersonaIdentifier
    onClose?: () => void
}

interface SignInfo {
    payload: NextIDPayload
    personaSign: string
    twitterPost: string
}

function SetupGuideUI(props: SetupGuideUIProps) {
    const { t } = useI18N()
    const { persona } = props
    const ui = activatedSocialNetworkUI
    const [step, setStep] = useState(SetupGuideStep.FindUsername)
    const [enableNextID] = useState(ui.configuration.nextIDConfig?.enable)
    const verifyPostCollectTimer = useRef<NodeJS.Timer | null>(null)
    const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform
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
    const getUsername = () => lastState.username || lastRecognized.identifier?.userId || ''
    const [username, setUsername] = useState(getUsername)

    const disableVerify =
        !lastRecognized.identifier || !lastState.username
            ? false
            : lastRecognized.identifier.userId !== lastState.username

    useEffect(() => {
        const handler = (val: IdentityResolved) => {
            if (username === '' && val.identifier) setUsername(val.identifier.userId)
        }
        return ui.collecting.identityProvider?.recognized.addListener(handler)
    }, [username])

    useEffect(() => {
        if (username || ui.networkIdentifier !== EnhanceableSite.Twitter) return
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
        return Services.Identity.queryPersona(persona)
    }, [persona])

    useEffect(() => {
        return CrossIsolationMessages.events.verifyNextID.on(() => {
            setStep(SetupGuideStep.VerifyOnNextID)
        })
    }, [])

    const onConnect = async () => {
        const id = ProfileIdentifier.of(ui.networkIdentifier, username)
        if (!id.some) return
        // attach persona with SNS profile
        await Services.Identity.attachProfile(id.val, persona, {
            connectionConfirmState: 'confirmed',
        })

        // auto-finish the setup process
        if (!persona_) throw new Error('invalid persona')
        await Services.Identity.setupPersona(persona_?.identifier)
    }

    const onVerify = async () => {
        if (!username) return
        if (!persona_) return
        const collectVerificationPost = ui.configuration.nextIDConfig?.collectVerificationPost

        const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform | undefined
        if (!platform) return

        const isBound = await Services.Helper.queryIsBound(persona_.identifier.publicKeyAsHex, platform, username)
        if (!isBound) {
            const payload = await Services.Helper.createPersonaPayload(
                persona_.identifier.publicKeyAsHex,
                NextIDAction.Create,
                username,
                platform,
                languageSettings.value ?? 'default',
            )
            if (!payload) throw new Error('Failed to create persona payload.')
            const signResult = await Services.Identity.signWithPersona({
                method: 'eth',
                message: payload.signPayload,
                identifier: persona_.identifier,
            })
            if (!signResult) throw new Error('Failed to sign by persona.')
            const signature = signResult.signature.signature
            const postContent = payload.postContent.replace('%SIG_BASE64%', toBase64(fromHex(signature)))
            ui.automation?.nativeCompositionDialog?.appendText?.(postContent, { recover: false })

            const waitingPost = new Promise<void>((resolve, reject) => {
                verifyPostCollectTimer.current = setInterval(async () => {
                    const post = collectVerificationPost?.(postContent)
                    if (post && persona_.identifier.publicKeyAsHex) {
                        clearInterval(verifyPostCollectTimer.current!)
                        await Services.Helper.bindProof(
                            payload.uuid,
                            persona_.identifier.publicKeyAsHex,
                            NextIDAction.Create,
                            platform,
                            username,
                            payload.createdAt,
                            {
                                signature,
                                proofLocation: post.postId,
                            },
                        )
                        resolve()
                    }
                }, 1000)

                setTimeout(() => {
                    clearInterval(verifyPostCollectTimer.current!)
                    reject({ message: t('setup_guide_verify_post_not_found') })
                }, 1000 * 20)
            })

            await waitingPost
            const isBound = await Services.Helper.queryIsBound(persona_.identifier.publicKeyAsHex, platform, username)
            if (!isBound) throw new Error('Failed to verify.')
            MaskMessages.events.ownProofChanged.sendToAll(undefined)
        }
    }

    const onClose = () => {
        currentSetupGuideStatus[ui.networkIdentifier].value = ''
        setStep(SetupGuideStep.Close)
    }

    const onConnected = async () => {
        if (enableNextID && persona_?.identifier.publicKeyAsHex && platform && username) {
            const isBound = await Services.Helper.queryIsBound(persona_.identifier.publicKeyAsHex, platform, username)
            if (!isBound) {
                currentSetupGuideStatus[ui.networkIdentifier].value = stringify({
                    status: SetupGuideStep.VerifyOnNextID,
                })
                setStep(SetupGuideStep.VerifyOnNextID)
                return
            }
        }

        if (!userPinExtension.value) {
            userPinExtension.value = true
            setStep(SetupGuideStep.PinExtension)
            return
        }

        onDone()
    }

    const onVerifyDone = async () => {
        if (!userPinExtension.value) {
            userPinExtension.value = true
            setStep(SetupGuideStep.PinExtension)
            return
        }

        onDone()
    }

    const onDone = async () => {
        const network = ui.networkIdentifier
        if (network === EnhanceableSite.Twitter && userGuideStatus[network].value !== userGuideVersion.value) {
            userGuideStatus[network].value = '1'
        } else {
            onCreate()
        }

        onClose()
    }

    const onCreate = async () => {
        let content = t('setup_guide_say_hello_content')
        if (ui.networkIdentifier === EnhanceableSite.Twitter) {
            content += t('setup_guide_say_hello_follow', { account: '@realMaskNetwork' })
        }

        ui.automation.maskCompositionDialog?.open?.(makeTypedMessageText(content), {
            target: EncryptionTargetType.Public,
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
                    onDone={onConnected}
                    onClose={onClose}
                    enableNextID={enableNextID}
                />
            )
        case SetupGuideStep.VerifyOnNextID:
            return (
                <VerifyNextID
                    personaIdentifier={persona_?.identifier}
                    personaName={persona_?.nickname}
                    username={username}
                    network={ui.networkIdentifier}
                    avatar={lastRecognized.avatar}
                    onUsernameChange={setUsername}
                    onVerify={onVerify}
                    onDone={onVerifyDone}
                    onClose={onClose}
                    disableVerify={disableVerify}
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
