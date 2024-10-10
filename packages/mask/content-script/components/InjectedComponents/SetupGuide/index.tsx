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
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { PinExtension } from './PinExtension.js'
import { SetupGuideContext } from './SetupGuideContext.js'
import { VerifyNextID } from './VerifyNextID.js'
import { CheckConnection } from './CheckConnection.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

// #region setup guide ui

function SetupGuideUI() {
    const { _ } = useLingui()
    const t = useMaskSharedTrans()

    const { step } = SetupGuideContext.useContainer()
    const { networkIdentifier } = activatedSiteAdaptorUI!

    const onClose = useCallback(() => {
        currentSetupGuideStatus[networkIdentifier].value = ''
        userPinExtension.value = true
    }, [])

    const onCreate = useCallback(() => {
        let content = _(
            msg`Hello Mask world. This is my first encrypted message. Install https://mask.io to send me encrypted post.`,
        )
        if (networkIdentifier === EnhanceableSite.Twitter) {
            content += _(msg`Follow @realMaskNetwork to explore Web3.`)
        }

        activatedSiteAdaptorUI!.automation.maskCompositionDialog?.open?.(
            makeTypedMessageText(content),
            _(msg`Please click the "Post" button to open the compose dialog.`),
            { target: EncryptionTargetType.Public },
        )
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

    switch (step) {
        case SetupGuideStep.CheckConnection:
            return <CheckConnection onClose={onClose} />
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
            <SetupGuideContext initialState={persona}>
                <SetupGuideUI />
            </SetupGuideContext>
        </div>
    )
})
// #endregion
