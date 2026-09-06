import { useCallback, type ReactElement, type RefObject } from 'react'
import { GuideStep as GuideStepUI, type GuideStepProps as GuideStepUIProps } from '@masknet/injected-ui/GuideStep'
import { sayHelloShowed, userGuideFinished, userGuideStatus } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import { Trans } from '@lingui/react/macro'

interface UseGuideStepStateOptions {
    step: number
    total: number
    onComplete?: () => void
}

/** The actual guide progress (which step is active, skip/finish persistence). Shared by GuideStep and any other injected component that needs to render its own guide tooltip (e.g. PostDialogHint). */
export function useGuideStepState({ step, total, onComplete }: UseGuideStepStateOptions) {
    const { networkIdentifier } = activatedSiteAdaptorUI!
    const currentStep = useValueRef(userGuideStatus[networkIdentifier])
    const finished = useValueRef(userGuideFinished[networkIdentifier])
    const visible = +currentStep === step && !finished

    const onSkip = useCallback(() => {
        sayHelloShowed[networkIdentifier].value = true
        userGuideFinished[networkIdentifier].value = true
    }, [networkIdentifier])

    const onNext = useCallback(() => {
        if (step !== total) {
            userGuideStatus[networkIdentifier].value = String(step + 1)
        }
        if (step === total - 1) {
            document.body.scrollIntoView()
        }
    }, [networkIdentifier, step, total])

    const onTry = useCallback(() => {
        userGuideFinished[networkIdentifier].value = true
        onComplete?.()
    }, [networkIdentifier, onComplete])

    return { visible, onSkip, onNext, onTry }
}

interface GuideStepProps
    extends Omit<GuideStepUIProps, 'visible' | 'onSkip' | 'onNext' | 'onTry' | 'skipLabel' | 'nextLabel' | 'tryLabel'> {
    // cloneElement is used.
    // eslint-disable-next-line @typescript-eslint/no-restricted-types
    children: ReactElement<{ ref: RefObject<HTMLElement | undefined> }>
    onComplete?: () => void
}

export default function GuideStep({ onComplete, ...props }: GuideStepProps) {
    const state = useGuideStepState({ step: props.step, total: props.total, onComplete })
    return (
        <GuideStepUI
            {...props}
            {...state}
            skipLabel={<Trans>Skip</Trans>}
            nextLabel={<Trans>Next</Trans>}
            tryLabel={<Trans>Try</Trans>}
        />
    )
}
