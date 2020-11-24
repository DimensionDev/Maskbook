import { memo } from 'react'
import { IconButton } from '@material-ui/core'
import { useMyIdentities } from '../DataSource/useActivatedUI'
import type { BannerProps } from '../Welcomes/Banner'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { currentSetupGuideStatus } from '../../settings/settings'
import { getActivatedUI } from '../../social-network/ui'
import { MaskbookSharpIcon } from '../../resources/MaskbookIcon'
import { makeStyles } from '@material-ui/core/styles'

export interface PostDialogHintUIProps {
    onHintButtonClicked: () => void
}

const useStyles = makeStyles((theme) => ({
    button: {
        padding: '8px',
    },
}))

export const PostDialogHintUI = memo(function PostDialogHintUI(props: PostDialogHintUIProps) {
    const classes = useStyles()
    return (
        <IconButton className={classes.button} onClick={props.onHintButtonClicked}>
            <MaskbookSharpIcon />
        </IconButton>
    )
})

export interface PostDialogHintProps extends Partial<PostDialogHintUIProps> {
    NotSetupYetPromptProps?: Partial<BannerProps>
}
export function PostDialogHint(props: PostDialogHintProps) {
    const identities = useMyIdentities()
    const connecting = useValueRef(currentSetupGuideStatus[getActivatedUI().networkIdentifier])
    if (connecting || identities.length === 0) return null
    return <PostDialogHintUI onHintButtonClicked={() => {}} {...props} />
}
