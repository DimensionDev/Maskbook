import { memo } from 'react'
import { IconButton } from '@material-ui/core'
import { useI18N } from '../../utils/i18n-next-ui'
import { useMyIdentities } from '../DataSource/useActivatedUI'
import type { BannerProps } from '../Welcomes/Banner'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { currentSetupGuideStatus } from '../../settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import { isMobileFacebook } from '../../social-network-adaptor/facebook.com/utils/isMobile'
import { MaskbookSharpIcon } from '../../resources/MaskbookIcon'
import { makeStyles } from '@material-ui/core/styles'

export interface PostDialogHintUIProps {
    onHintButtonClicked: () => void
}

const useStyles = makeStyles((theme) => ({
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
    const classes = useStyles()
    return (
        <IconButton className={classes.button} onClick={props.onHintButtonClicked}>
            <MaskbookSharpIcon />
        </IconButton>
    )
})

export const PostDialogHintUI = memo(function PostDialogHintUI({ onHintButtonClicked }: PostDialogHintUIProps) {
    const classes = useStyles()
    const { t } = useI18N()

    return isMobileFacebook ? (
        <div className={classes.wrapper} onClick={onHintButtonClicked}>
            <EntryIconButton onHintButtonClicked={() => undefined} />
            <span className={classes.text}>{t('post_modal_hint__button')}</span>
        </div>
    ) : (
        <EntryIconButton onHintButtonClicked={onHintButtonClicked} />
    )
})

export interface PostDialogHintProps extends Partial<PostDialogHintUIProps> {
    NotSetupYetPromptProps?: Partial<BannerProps>
}
export function PostDialogHint(props: PostDialogHintProps) {
    const identities = useMyIdentities()
    const connecting = useValueRef(currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier])
    if (connecting || identities.length === 0) return null
    return <PostDialogHintUI onHintButtonClicked={() => {}} {...props} />
}
