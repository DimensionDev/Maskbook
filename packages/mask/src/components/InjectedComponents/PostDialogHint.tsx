import { Icons } from '@masknet/icons'
import { MaskColors, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { IconButton, Typography } from '@mui/material'
import { memo } from 'react'
import { isMobileFacebook } from '../../site-adaptors/facebook.com/utils/isMobile.js'
import { useI18N } from '../../utils/index.js'
import GuideStep from '../GuideStep/index.js'

interface TooltipConfigProps {
    placement?: 'bottom' | 'top'
    disabled?: boolean
}

export interface PostDialogHintUIProps extends withClasses<'buttonTransform' | 'iconButton' | 'tooltip'> {
    disableGuideTip?: boolean
    size?: number
    tooltip?: TooltipConfigProps
    iconType?: string
    onHintButtonClicked: () => void
}

const useStyles = makeStyles()((theme) => ({
    button: {
        // TODO: is it correct? (what about twitter?)
        padding: isMobileFacebook ? 0 : '7px',
    },
    text: {
        color: theme.palette.grey[300],
        marginLeft: theme.spacing(1),
    },
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '8px 10px',
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}))

const ICON_MAP: Record<string, JSX.Element> = {
    minds: <Icons.MaskInMinds size={18} />,
    default: <Icons.SharpMask size={17} color={MaskColors.light.maskColor.publicTwitter} />,
}

const EntryIconButton = memo((props: PostDialogHintUIProps) => {
    const { t } = useI18N()
    const { tooltip, disableGuideTip } = props
    const { classes, cx } = useStyles(undefined, { props })

    const getEntry = () => (
        <ShadowRootTooltip
            title={t('mask_network')}
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
                {ICON_MAP?.[props?.iconType ?? 'default']}
            </IconButton>
        </ShadowRootTooltip>
    )

    return disableGuideTip ? (
        getEntry()
    ) : (
        <GuideStep step={4} total={4} tip={t('user_guide_tip_4')} onComplete={props.onHintButtonClicked}>
            {getEntry()}
        </GuideStep>
    )
})

export const PostDialogHint = memo(function PostDialogHintUI(props: PostDialogHintUIProps) {
    const { onHintButtonClicked, size, ...others } = props
    const { classes } = useStyles(undefined, { props })
    const { t } = useI18N()

    return isMobileFacebook ? (
        <div className={classes.wrapper} onClick={onHintButtonClicked}>
            <EntryIconButton size={size} onHintButtonClicked={() => undefined} />
            <Typography className={classes.text}>{t('post_modal_hint__button')}</Typography>
        </div>
    ) : (
        <div className={classes.buttonTransform}>
            <EntryIconButton size={size} onHintButtonClicked={onHintButtonClicked} {...others} />
        </div>
    )
})
