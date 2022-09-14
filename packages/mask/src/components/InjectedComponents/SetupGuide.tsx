import { useState, useRef } from 'react'
import { makeStyles } from '@masknet/theme'
import { useI18N, MaskMessages } from '../../utils/index.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import {
    currentSetupGuideStatus,
    languageSettings,
    userGuideStatus,
    userGuideVersion,
} from '../../../shared/legacy-settings/settings.js'
import { makeTypedMessageText } from '@masknet/typed-message'
import {
    PersonaIdentifier,
    ProfileIdentifier,
    NextIDPlatform,
    toBase64,
    fromHex,
    NextIDAction,
    EnhanceableSite,
    EncryptionTargetType,
} from '@masknet/shared-base'
import Services from '../../extension/service.js'
import { SetupGuideStep } from '../../../shared/legacy-settings/types.js'
import { FindUsername } from './SetupGuide/FindUsername.js'
import { VerifyNextID } from './SetupGuide/VerifyNextID.js'
import { PinExtension } from './SetupGuide/PinExtension.js'
import { NextIDProof } from '@masknet/web3-providers'
import { useSetupGuideStepInfo } from './SetupGuide/useSetupGuideStepInfo'

// #region setup guide ui
interface SetupGuideUIProps {
    persona: PersonaIdentifier
    onClose?: () => void
}

function SetupGuideUI(props: SetupGuideUIProps) {
    const { t } = useI18N()
    const { persona } = props
    const ui = activatedSocialNetworkUI
    const [enableNextID] = useState(ui.configuration.nextIDConfig?.enable)
    const verifyPostCollectTimer = useRef<NodeJS.Timer | null>(null)
    const {
        value: { step, userId, currentIdentityResolved, destinedPersonaInfo } = {
            step: SetupGuideStep.Close,
            userId: '',
        },
        retry: retryCheckStep,
    } = useSetupGuideStepInfo(persona)

    // todo: refactor this
    // const disableVerify =
    //     !currentIdentityResolved.identifier || !lastState.userId
    //         ? false
    //         : currentIdentityResolved.identifier.userId !== lastState.userId

    // // #endregion

    const onConnect = async () => {
        const id = ProfileIdentifier.of(ui.networkIdentifier, userId)
        if (!id.some) return
        // attach persona with SNS profile
        await Services.Identity.attachProfile(id.val, persona, {
            connectionConfirmState: 'confirmed',
        })

        // auto-finish the setup process
        if (!destinedPersonaInfo) throw new Error('invalid persona')
        await Services.Identity.setupPersona(destinedPersonaInfo?.identifier)
    }

    const onVerify = async () => {
        if (!userId) return
        if (!destinedPersonaInfo) return
        const collectVerificationPost = ui.configuration.nextIDConfig?.collectVerificationPost

        const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform | undefined
        if (!platform) return

        const isBound = await NextIDProof.queryIsBound(destinedPersonaInfo.identifier.publicKeyAsHex, platform, userId)
        if (!isBound) {
            const payload = await NextIDProof.createPersonaPayload(
                destinedPersonaInfo.identifier.publicKeyAsHex,
                NextIDAction.Create,
                userId,
                platform,
                languageSettings.value ?? 'default',
            )
            if (!payload) throw new Error('Failed to create persona payload.')
            const signResult = await Services.Identity.signWithPersona({
                method: 'eth',
                message: payload.signPayload,
                identifier: destinedPersonaInfo.identifier,
            })
            if (!signResult) throw new Error('Failed to sign by persona.')
            const signature = signResult.signature.signature
            const postContent = payload.postContent.replace('%SIG_BASE64%', toBase64(fromHex(signature)))
            ui.automation?.nativeCompositionDialog?.appendText?.(postContent, { recover: false })

            const waitingPost = new Promise<void>((resolve, reject) => {
                verifyPostCollectTimer.current = setInterval(async () => {
                    const post = collectVerificationPost?.(postContent)
                    if (post && destinedPersonaInfo.identifier.publicKeyAsHex) {
                        clearInterval(verifyPostCollectTimer.current!)
                        await NextIDProof.bindProof(
                            payload.uuid,
                            destinedPersonaInfo.identifier.publicKeyAsHex,
                            NextIDAction.Create,
                            platform,
                            userId,
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
            const isBound = await NextIDProof.queryIsBound(
                destinedPersonaInfo.identifier.publicKeyAsHex,
                platform,
                userId,
            )
            if (!isBound) throw new Error('Failed to verify.')
            MaskMessages.events.ownProofChanged.sendToAll(undefined)
        }
    }

    const onClose = () => {
        currentSetupGuideStatus[ui.networkIdentifier].value = ''
        // retryCheckStep()
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
                    personaName={destinedPersonaInfo?.nickname}
                    username={userId}
                    avatar={currentIdentityResolved?.avatar}
                    onConnect={onConnect}
                    onDone={retryCheckStep}
                    onClose={onClose}
                    enableNextID={enableNextID}
                />
            )
        case SetupGuideStep.VerifyOnNextID:
            return (
                <VerifyNextID
                    personaIdentifier={destinedPersonaInfo?.identifier}
                    personaName={destinedPersonaInfo?.nickname}
                    username={userId}
                    network={ui.networkIdentifier}
                    avatar={currentIdentityResolved?.avatar}
                    onVerify={onVerify}
                    onDone={retryCheckStep}
                    onClose={onClose}
                    disableVerify={false}
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
