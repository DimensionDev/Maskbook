import { Icons } from '@masknet/icons'
import { MaskColors, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { IconButton } from '@mui/material'
import { memo, type JSX, type ReactNode } from 'react'
import { GuideStep, type GuideStepProps } from './GuideStep.js'

interface TooltipConfigProps {
    placement?: 'bottom' | 'top'
    disabled?: boolean
}

export interface PostDialogHintGuideProps
    extends Pick<
        GuideStepProps,
        'total' | 'step' | 'tip' | 'visible' | 'onSkip' | 'onNext' | 'onTry' | 'skipLabel' | 'nextLabel' | 'tryLabel'
    > {}

export interface PostDialogHintProps extends withClasses<'buttonTransform' | 'iconButton' | 'tooltip'> {
    size?: number
    tooltip?: TooltipConfigProps
    tooltipTitle?: ReactNode
    iconType?: string
    onHintButtonClicked: () => void
    /** Renders the onboarding tooltip around the icon when provided; omit to skip it entirely. */
    guide?: PostDialogHintGuideProps
}

const useStyles = makeStyles()(() => ({
    button: {
        padding: 'var(--icon-padding, 10px)',
    },
}))

const ICON_MAP: { [property: string]: JSX.Element } = {
    minds: <Icons.MaskInMinds size={18} />,
    default: (
        <Icons.SharpMask
            style={{
                height: 'var(--icon-size, 17px)',
                width: 'var(--icon-size, 17px)',
            }}
            color={MaskColors.light.maskColor.publicTwitter}
        />
    ),
}

const EntryIconButton = memo(function EntryIconButton(props: PostDialogHintProps) {
    const { tooltip, tooltipTitle = 'Mask Network', guide } = props
    const { classes, cx } = useStyles(undefined, { props })

    const Entry = (
        <ShadowRootTooltip
            title={tooltipTitle}
            placement={tooltip?.placement}
            disableHoverListener={tooltip?.disabled}
            slotProps={{ popper: { disablePortal: false } }}
            arrow>
            <IconButton
                size="large"
                className={cx(classes.button, classes.iconButton)}
                onClick={props.onHintButtonClicked}>
                {ICON_MAP[props.iconType ?? 'default']}
            </IconButton>
        </ShadowRootTooltip>
    )

    return guide ?
            <GuideStep {...guide}>{Entry}</GuideStep>
        :   Entry
})

/**
 * The small Mask badge injected next to a platform's own "compose"/"post" button.
 * Pure UI: which persona/guide state applies is resolved by the caller, see
 * packages/mask/content-script/components/InjectedComponents/PostDialogHint.tsx.
 */
export const PostDialogHint = memo(function PostDialogHint(props: PostDialogHintProps) {
    const { onHintButtonClicked, size, ...others } = props
    const { classes } = useStyles(undefined, { props })
    return (
        <div className={classes.buttonTransform}>
            <EntryIconButton size={size} onHintButtonClicked={onHintButtonClicked} {...others} />
        </div>
    )
})
