import { Icons } from '@masknet/icons'
import { MaskColors, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { IconButton } from '@mui/material'
import { memo } from 'react'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import GuideStep from '../GuideStep/index.js'

interface TooltipConfigProps {
    placement?: 'bottom' | 'top'
    disabled?: boolean
}

interface PostDialogHintUIProps extends withClasses<'buttonTransform' | 'iconButton' | 'tooltip'> {
    disableGuideTip?: boolean
    size?: number
    tooltip?: TooltipConfigProps
    iconType?: string
    onHintButtonClicked: () => void
}

const useStyles = makeStyles()((theme) => ({
    button: {
        padding: 'var(--icon-padding, 10px)',
    },
}))

const ICON_MAP: Record<string, JSX.Element> = {
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

const EntryIconButton = memo(function EntryIconButton(props: PostDialogHintUIProps) {
    const t = useMaskSharedTrans()
    const { tooltip, disableGuideTip } = props
    const { classes, cx } = useStyles(undefined, { props })

    const Entry = (
        <ShadowRootTooltip
            title={t.mask_network()}
            placement={tooltip?.placement}
            disableHoverListener={tooltip?.disabled}
            PopperProps={{
                disablePortal: false,
            }}
            arrow>
            <IconButton
                size="large"
                className={cx(classes.button, classes.iconButton)}
                onClick={props.onHintButtonClicked}>
                {ICON_MAP[props.iconType ?? 'default']}
            </IconButton>
        </ShadowRootTooltip>
    )

    return disableGuideTip ? Entry : (
            <GuideStep step={4} total={4} tip={t.user_guide_tip_4()} onComplete={props.onHintButtonClicked}>
                {Entry}
            </GuideStep>
        )
})

export const PostDialogHint = memo(function PostDialogHintUI(props: PostDialogHintUIProps) {
    const { onHintButtonClicked, size, ...others } = props
    const { classes } = useStyles(undefined, { props })
    const t = useMaskSharedTrans()
    return (
        <div className={classes.buttonTransform}>
            <EntryIconButton size={size} onHintButtonClicked={onHintButtonClicked} {...others} />
        </div>
    )
})
