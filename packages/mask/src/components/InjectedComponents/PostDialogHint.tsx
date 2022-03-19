import { memo } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { useStylesExtends, makeStyles } from '@masknet/theme'
import { useI18N } from '../../utils'
import type { BannerProps } from '../Welcomes/Banner'
import { useValueRef } from '@masknet/shared-base-ui'
import { isMobileFacebook } from '../../social-network-adaptor/facebook.com/utils/isMobile'
import { MaskSharpIcon } from '../../resources/MaskIcon'
import { useMyIdentities } from '../DataSource/useActivatedUI'
import { currentSetupGuideStatus } from '../../settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import classNames from 'classnames'
import GuideStep from '../GuideStep'

interface TooltipConfigProps {
    placement?: 'bottom' | 'top'
    disabled?: boolean
}

export interface PostDialogHintUIProps extends withClasses<'buttonTransform' | 'iconButton' | 'tooltip'> {
    size?: number
    tooltip?: TooltipConfigProps
    onHintButtonClicked: () => void
}

const useStyles = makeStyles()((theme) => ({
    button: {
        // TODO: is it correct? (what about twitter?)
        padding: isMobileFacebook ? 0 : '8px',
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
}))

const EntryIconButton = memo((props: PostDialogHintUIProps) => {
    const { t } = useI18N()
    const { size, tooltip } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <GuideStep step={3} total={3} tip={t('user_guide_tip_3')} onComplete={props.onHintButtonClicked}>
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
                    <MaskSharpIcon size={size} color="primary" />
                </IconButton>
            </Tooltip>
        </GuideStep>
    )
})

export const PostDialogHintUI = memo(function PostDialogHintUI(props: PostDialogHintUIProps) {
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

export interface PostDialogHintProps extends Partial<PostDialogHintUIProps> {
    NotSetupYetPromptProps?: Partial<BannerProps>
    size?: number
}
export function PostDialogHint(props: PostDialogHintProps) {
    const identities = useMyIdentities()
    const connecting = useValueRef(currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier])

    if (connecting || identities.length === 0) return null
    return <PostDialogHintUI onHintButtonClicked={() => {}} {...props} />
}
