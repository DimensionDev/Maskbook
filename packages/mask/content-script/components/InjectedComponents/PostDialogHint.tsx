import {
    PostDialogHint as PostDialogHintUI,
    type PostDialogHintProps as PostDialogHintUIProps,
} from '@masknet/injected-ui/PostDialogHint'
import { useGuideStepState } from '../GuideStep/index.js'
import { Trans } from '@lingui/react/macro'

interface PostDialogHintProps extends Omit<PostDialogHintUIProps, 'guide' | 'tooltipTitle'> {
    disableGuideTip?: boolean
}

export function PostDialogHint({ disableGuideTip, onHintButtonClicked, ...rest }: PostDialogHintProps) {
    const guideState = useGuideStepState({ step: 4, total: 4, onComplete: onHintButtonClicked })
    return (
        <PostDialogHintUI
            {...rest}
            onHintButtonClicked={onHintButtonClicked}
            tooltipTitle={<Trans>Mask Network</Trans>}
            guide={
                disableGuideTip ? undefined : (
                    {
                        step: 4,
                        total: 4,
                        tip: <Trans>Click here to have a quick start.</Trans>,
                        skipLabel: <Trans>Skip</Trans>,
                        nextLabel: <Trans>Next</Trans>,
                        tryLabel: <Trans>Try</Trans>,
                        ...guideState,
                    }
                )
            }
        />
    )
}
