import { memo } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { useStylesExtends, makeStyles } from '@masknet/theme'
import { useI18N } from '../../utils'
import { isMobileFacebook } from '../../social-network-adaptor/facebook.com/utils/isMobile'
import { MaskSharpIcon, MaskIconInMinds } from '../../resources/MaskIcon'
import classNames from 'classnames'
import GuideStep from '../GuideStep'

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
        fontSize: 14,
        color: '#606770',
        marginLeft: theme.spacing(1),
    },
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '8px 10px',
        borderBottom: '1px solid #dadde1',
    },
    tooltip: {
        color: 'white',
    },
}))

const ICON_MAP: Record<string, JSX.Element> = {
    minds: <MaskIconInMinds />,
    default: <MaskSharpIcon color="primary" />,
}

const EntryIconButton = memo((props: PostDialogHintUIProps) => {
    const { t } = useI18N()
    const { tooltip, disableGuideTip } = props
    const classes = useStylesExtends(useStyles(), props)

    const getEntry = () => (
        <Tooltip
            title="Mask Network"
            classes={{ tooltip: classes.tooltip }}
            placement={tooltip?.placement}
            disableHoverListener={tooltip?.disabled}
            PopperProps={{
                disablePortal: true,
            }}>
            <IconButton
                size="large"
                className={classNames(classes.button, classes.iconButton)}
                onClick={props.onHintButtonClicked}>
                {ICON_MAP?.[props?.iconType ?? 'default']}
            </IconButton>
        </Tooltip>
    )

    return disableGuideTip ? (
        getEntry()
    ) : (
        <GuideStep step={4} total={4} tip={t('user_guide_tip_4')}>
            {getEntry()}
        </GuideStep>
    )
})

export const PostDialogHint = memo(function PostDialogHintUI(props: PostDialogHintUIProps) {
    const { onHintButtonClicked, size, ...others } = props
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()

    return isMobileFacebook ? (
        <div className={classes.wrapper} onClick={onHintButtonClicked}>
            <EntryIconButton size={size} onHintButtonClicked={() => undefined} />
            <span className={classes.text}>{t('post_modal_hint__button')}</span>
        </div>
    ) : (
        <div className={classes.buttonTransform}>
            <EntryIconButton size={size} onHintButtonClicked={onHintButtonClicked} {...others} />
        </div>
    )
})
