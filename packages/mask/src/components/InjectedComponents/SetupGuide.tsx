import { useState, useEffect, useMemo, useCallback } from 'react'
import stringify from 'json-stable-stringify'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { makeTypedMessageText } from '@masknet/typed-message'
import { NextIDProof } from '@masknet/web3-providers'
import {
    PersonaIdentifier,
    ProfileIdentifier,
    NextIDPlatform,
    EnhanceableSite,
    EncryptionTargetType,
} from '@masknet/shared-base'
import { useI18N } from '../../utils/index.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import {
    currentSetupGuideStatus,
    userGuideFinished,
    userGuideStatus,
    userPinExtension,
} from '../../../shared/legacy-settings/settings.js'
import Services from '../../extension/service.js'
import { SetupGuideStep } from '../../../shared/legacy-settings/types.js'
import { FindUsername } from './SetupGuide/FindUsername.js'
import { VerifyNextID } from './SetupGuide/VerifyNextID.js'
import { PinExtension } from './SetupGuide/PinExtension.js'
import { useSetupGuideStepInfo } from './SetupGuide/useSetupGuideStepInfo.js'
import { useNextIDVerify } from '../DataSource/useNextIDVerify.js'

// #region setup guide ui
interface SetupGuideUIProps {
    persona: PersonaIdentifier
    onClose?: () => void
}

function SetupGuideUI(props: SetupGuideUIProps) {
    const UI = activatedSocialNetworkUI

    const { t } = useI18N()
    const { persona } = props
    const { showSnackbar } = useCustomSnackbar()
    const [, handleVerifyNextID] = useNextIDVerify()
    const [enableNextID] = useState(UI.configuration.nextIDConfig?.enable)

    const {
        value: { type, step, userId, currentIdentityResolved, destinedPersonaInfo } = {
            type: 'close',
            userId: '',
            step: SetupGuideStep.Close,
        },
        loading: loadingSetupGuideStep,
        retry: retryCheckStep,
    } = useSetupGuideStepInfo(persona)

    // #region should not show notification if user have operation
    const [hasOperation, setOperation] = useState(false)

    const notify = useCallback(
        () =>
            showSnackbar(t('setup_guide_connected_title'), {
                variant: 'success',
                message: t('setup_guide_connected_description'),
            }),
        [t, showSnackbar],
    )

    useEffect(() => {
        if (!(type === 'done' && !hasOperation)) return

        notify()
        // currentSetupGuideStatus[UI.networkIdentifier].value = ''
    }, [type, hasOperation, notify])
    // #endregion

    const disableVerify = useMemo(
        () =>
            !currentIdentityResolved?.identifier || !userId
                ? false
                : currentIdentityResolved?.identifier.userId !== userId,
        [currentIdentityResolved, userId],
    )

    const onConnect = useCallback(async () => {
        const id = ProfileIdentifier.of(UI.networkIdentifier, userId)
        if (!id.some) return
        // attach persona with SNS profile
        await Services.Identity.attachProfile(id.val, persona, {
            connectionConfirmState: 'confirmed',
        })

        // auto-finish the setup process
        if (!destinedPersonaInfo) throw new Error('invalid persona')
        await Services.Identity.setupPersona(destinedPersonaInfo?.identifier)

        setOperation(true)
        if (step !== SetupGuideStep.FindUsername) return

        currentSetupGuideStatus[UI.networkIdentifier].value = stringify({
            status: SetupGuideStep.VerifyOnNextID,
        })
    }, [UI.networkIdentifier, destinedPersonaInfo, step])

    const onVerify = useCallback(async () => {
        if (!userId) return
        if (!destinedPersonaInfo) return

        const platform = UI.configuration.nextIDConfig?.platform as NextIDPlatform | undefined
        if (!platform) return

        const isBound = await NextIDProof.queryIsBound(destinedPersonaInfo.identifier.publicKeyAsHex, platform, userId)
        if (isBound) return

        const afterVerify = () => setOperation(true)
        await handleVerifyNextID(destinedPersonaInfo, userId, afterVerify)
    }, [userId, destinedPersonaInfo])

    const onVerifyDone = useCallback(() => {
        if (step === SetupGuideStep.VerifyOnNextID) {
            currentSetupGuideStatus[UI.networkIdentifier].value = ''
        }
        retryCheckStep()
    }, [step, retryCheckStep])

    const onClose = useCallback(() => {
        currentSetupGuideStatus[UI.networkIdentifier].value = ''
        userPinExtension.value = true
    }, [])

    const onCreate = useCallback(() => {
        let content = t('setup_guide_say_hello_content')
        if (UI.networkIdentifier === EnhanceableSite.Twitter) {
            content += t('setup_guide_say_hello_follow', { account: '@realMaskNetwork' })
        }

        UI.automation.maskCompositionDialog?.open?.(makeTypedMessageText(content), {
            target: EncryptionTargetType.Public,
        })
    }, [])

    const onPinClose = useCallback(() => {
        userPinExtension.value = true
    }, [])

    const onPinDone = useCallback(() => {
        const network = UI.networkIdentifier
        if (!userPinExtension.value) {
            userPinExtension.value = true
        }
        if (network === EnhanceableSite.Twitter && !userGuideFinished[network].value) {
            userGuideStatus[network].value = '1'
        } else {
            onCreate()
        }
    }, [onCreate])

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
                    stepUpdating={loadingSetupGuideStep}
                />
            )
        case SetupGuideStep.VerifyOnNextID:
            return (
                <VerifyNextID
                    personaIdentifier={destinedPersonaInfo?.identifier}
                    personaName={destinedPersonaInfo?.nickname}
                    username={userId}
                    network={UI.networkIdentifier}
                    avatar={currentIdentityResolved?.avatar}
                    onVerify={onVerify}
                    onDone={onVerifyDone}
                    onClose={onClose}
                    disableVerify={disableVerify}
                />
            )
        case SetupGuideStep.PinExtension:
            return <PinExtension onDone={onPinDone} onClose={onPinClose} />
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
