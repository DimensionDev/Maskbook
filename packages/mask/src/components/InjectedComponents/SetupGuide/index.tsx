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
import { makeStyles } from '@masknet/theme'
import { makeTypedMessageText } from '@masknet/typed-message'
import { memo, useCallback } from 'react'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/index.js'
import { useMaskSharedTrans } from '../../../utils/index.js'
import { FindUsername } from './FindUsername.js'
import { PinExtension } from './PinExtension.js'
import { SetupGuideContext } from './SetupGuideContext.js'
import { VerifyNextID } from './VerifyNextID.js'
import { useConnectPersona } from './hooks/useConnectPersona.js'

// #region setup guide ui

function SetupGuideUI() {
    const { t } = useMaskSharedTrans()

    const { step, setStep } = SetupGuideContext.useContainer()
    const { networkIdentifier } = activatedSiteAdaptorUI!

    const onClose = useCallback(() => {
        currentSetupGuideStatus[networkIdentifier].value = ''
        userPinExtension.value = true
    }, [])

    const onCreate = useCallback(() => {
        let content = t('setup_guide_say_hello_content')
        if (networkIdentifier === EnhanceableSite.Twitter) {
            content += t('setup_guide_say_hello_follow', { account: '@realMaskNetwork' })
        }

        activatedSiteAdaptorUI!.automation.maskCompositionDialog?.open?.(makeTypedMessageText(content), {
            target: EncryptionTargetType.Public,
        })
    }, [t])

    const onPinClose = useCallback(() => {
        userPinExtension.value = true
        onClose()
    }, [])

    const onPinDone = useCallback(() => {
        const network = networkIdentifier
        if (!userPinExtension.value) {
            userPinExtension.value = true
        }
        if (network === EnhanceableSite.Twitter && !userGuideFinished[network].value) {
            userGuideStatus[network].value = '1'
        } else {
            onCreate()
        }
    }, [onCreate])

    const [, connectPersona] = useConnectPersona()
    const handleNext = useCallback(async () => {
        await connectPersona()
        setStep(SetupGuideStep.VerifyOnNextID)
    }, [connectPersona])

    switch (step) {
        case SetupGuideStep.FindUsername:
            return <FindUsername onClose={onClose} onDone={handleNext} />
        case SetupGuideStep.VerifyOnNextID:
            return <VerifyNextID onClose={onClose} />
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

interface SetupGuideProps {
    persona: PersonaIdentifier
}

export const SetupGuide = memo(function SetupGuide({ persona }: SetupGuideProps) {
    const { classes } = useSetupGuideStyles()

    return (
        <div className={classes.root}>
            <SetupGuideContext.Provider initialState={persona}>
                <SetupGuideUI />
            </SetupGuideContext.Provider>
        </div>
    )
})
// #endregion
