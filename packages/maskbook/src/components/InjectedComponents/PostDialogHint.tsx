import { memo } from 'react'
import { IconButton } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../utils'
import { useMyIdentities } from '../DataSource/useActivatedUI'
import type { BannerProps } from '../Welcomes/Banner'
import { useValueRef, useStylesExtends } from '@masknet/shared'
import { currentSetupGuideStatus } from '../../settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import { isMobileFacebook } from '../../social-network-adaptor/facebook.com/utils/isMobile'
import { MaskSharpIcon } from '../../resources/MaskIcon'
import GuideStep from '../GuideStep'

export interface PostDialogHintUIProps extends withClasses<'buttonTransform'> {
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
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()

    return (
        <GuideStep step={3} total={3} tip={t('user_guide_tip_3')}>
            <IconButton size="large" className={classes.button} onClick={props.onHintButtonClicked}>
                <MaskSharpIcon color="primary" />
            </IconButton>
        </GuideStep>
    )
})

export const PostDialogHintUI = memo(function PostDialogHintUI(props: PostDialogHintUIProps) {
    const { onHintButtonClicked } = props
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()

    return isMobileFacebook ? (
        <div className={classes.wrapper} onClick={onHintButtonClicked}>
            <EntryIconButton onHintButtonClicked={() => undefined} />
            <span className={classes.text}>{t('post_modal_hint__button')}</span>
        </div>
    ) : (
        <div className={classes.buttonTransform}>
            <EntryIconButton onHintButtonClicked={onHintButtonClicked} />
        </div>
    )
})

export interface PostDialogHintProps extends Partial<PostDialogHintUIProps> {
    NotSetupYetPromptProps?: Partial<BannerProps>
}
export function PostDialogHint(props: PostDialogHintProps) {
    const identities = useMyIdentities()
    const connecting = useValueRef(currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier])

    if ((connecting && !/[1-4]/.test(connecting)) || identities.length === 0) return null
    return <PostDialogHintUI onHintButtonClicked={() => {}} {...props} />
}
