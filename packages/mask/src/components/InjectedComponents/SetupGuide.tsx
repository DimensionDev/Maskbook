import Services from '#services'
import {
    EncryptionTargetType,
    EnhanceableSite,
    SetupGuideStep,
    currentSetupGuideStatus,
    userGuideFinished,
    userGuideStatus,
    userPinExtension,
    type PersonaIdentifier,
} from '@masknet/shared-base'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { makeTypedMessageText } from '@masknet/typed-message'
import { NextIDProof } from '@masknet/web3-providers'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { useQuery } from '@tanstack/react-query'
import stringify from 'json-stable-stringify'
import { useCallback, useMemo } from 'react'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import { useMaskSharedTrans } from '../../utils/index.js'
import { useNextIDVerify } from '../DataSource/useNextIDVerify.js'
import { FindUsername } from './SetupGuide/FindUsername.js'
import { PinExtension } from './SetupGuide/PinExtension.js'
import { VerifyNextID } from './SetupGuide/VerifyNextID.js'
import { useSetupGuideStepInfo } from './SetupGuide/useSetupGuideStepInfo.js'

// #region setup guide ui
interface SetupGuideUIProps {
    persona: PersonaIdentifier
    onClose?: () => void
}

function SetupGuideUI(props: SetupGuideUIProps) {
    const { t } = useMaskSharedTrans()
    const { persona } = props
    const { showSnackbar } = useCustomSnackbar()
    const [, handleVerifyNextID] = useNextIDVerify()

    const { step, userId, currentIdentityResolved, destinedPersonaInfo, setConfirmConnected } =
        useSetupGuideStepInfo(persona)

    // #region should not show notification
    const notify = useCallback(
        () =>
            showSnackbar(t('setup_guide_connected_title'), {
                variant: 'success',
                message: t('setup_guide_connected_description'),
            }),
        [t, showSnackbar],
    )

    // #endregion

    const disableVerify = useMemo(() => {
        return !currentIdentityResolved?.identifier || !userId
            ? false
            : currentIdentityResolved?.identifier.userId !== userId
    }, [currentIdentityResolved, userId])

    const onVerify = useCallback(async () => {
        if (!userId) return
        if (!destinedPersonaInfo) return

        const platform = activatedSiteAdaptorUI!.configuration.nextIDConfig?.platform
        if (!platform) return

        const isBound = await NextIDProof.queryIsBound(
            destinedPersonaInfo.identifier.publicKeyAsHex,
            platform,
            userId,
            true,
        )
        if (isBound) return

        await handleVerifyNextID(destinedPersonaInfo, userId)
        notify()
        currentSetupGuideStatus[activatedSiteAdaptorUI!.networkIdentifier].value = ''
        Telemetry.captureEvent(EventType.Access, EventID.EntryPopupSocialAccountVerifyTwitter)
    }, [userId, destinedPersonaInfo, notify])

    const onVerifyDone = useCallback(() => {
        if (step !== SetupGuideStep.VerifyOnNextID) return
        currentSetupGuideStatus[activatedSiteAdaptorUI!.networkIdentifier].value = ''
    }, [step])

    const onClose = useCallback(() => {
        currentSetupGuideStatus[activatedSiteAdaptorUI!.networkIdentifier].value = ''
        userPinExtension.value = true
    }, [])

    const onCreate = useCallback(() => {
        let content = t('setup_guide_say_hello_content')
        if (activatedSiteAdaptorUI!.networkIdentifier === EnhanceableSite.Twitter) {
            content += t('setup_guide_say_hello_follow', { account: '@realMaskNetwork' })
        }

        activatedSiteAdaptorUI!.automation.maskCompositionDialog?.open?.(makeTypedMessageText(content), {
            target: EncryptionTargetType.Public,
        })
    }, [t])

    const onPinClose = useCallback(() => {
        userPinExtension.value = true
    }, [])

    const onPinDone = useCallback(() => {
        const network = activatedSiteAdaptorUI!.networkIdentifier
        if (!userPinExtension.value) {
            userPinExtension.value = true
        }
        if (network === EnhanceableSite.Twitter && !userGuideFinished[network].value) {
            userGuideStatus[network].value = '1'
        } else {
            onCreate()
        }
    }, [onCreate])

    const { data: personaAvatar } = useQuery({
        queryKey: ['my-own-persona-info'],
        queryFn: () => {
            return Services.Identity.queryOwnedPersonaInformation(false)
        },
        select(data) {
            const pubkey = destinedPersonaInfo?.identifier.publicKeyAsHex
            const info = data.find((x) => x.identifier.publicKeyAsHex === pubkey)
            return info?.avatar
        },
    })
    const handleNext = useCallback(() => {
        setConfirmConnected(true)
        currentSetupGuideStatus[activatedSiteAdaptorUI!.networkIdentifier].value = stringify({
            status: SetupGuideStep.VerifyOnNextID,
        })
    }, [])

    switch (step) {
        case SetupGuideStep.FindUsername:
            return <FindUsername persona={persona} onClose={onClose} onDone={handleNext} />
        case SetupGuideStep.VerifyOnNextID:
            return (
                <VerifyNextID
                    personaIdentifier={destinedPersonaInfo?.identifier}
                    personaName={destinedPersonaInfo?.nickname}
                    username={currentIdentityResolved.nickname}
                    userId={userId}
                    network={activatedSiteAdaptorUI!.networkIdentifier}
                    avatar={currentIdentityResolved?.avatar}
                    personaAvatar={personaAvatar}
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
