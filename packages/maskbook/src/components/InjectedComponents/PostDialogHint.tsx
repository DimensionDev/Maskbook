import React from 'react'
import { Card, Typography, Button } from '@material-ui/core'
import { useI18N } from '../../utils/i18n-next-ui'
import { makeStyles } from '@material-ui/core/styles'
import { useStylesExtends } from '../custom-ui-helper'
import { useMyIdentities } from '../DataSource/useActivatedUI'
import type { BannerProps } from '../Welcomes/Banner'
import { NotSetupYetPrompt } from '../shared/NotSetupYetPrompt'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { currentSetupGuideStatus } from '../../settings/settings'
import { getActivatedUI } from '../../social-network/ui'

const useStyles = makeStyles((theme) => ({
    content: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 12px',
        [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
            flexDirection: 'column',
        },
    },
    button: {
        whiteSpace: 'nowrap',
    },
    title: {
        userSelect: 'none',
        fontSize: 15,
        fontWeight: 'bold',
        [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
            marginBottom: theme.spacing(0.75),
        },
    },
}))

export interface PostDialogHintUIProps extends withClasses<KeysInferFromUseStyles<typeof useStyles> | 'root'> {
    onHintButtonClicked: () => void
}
export const PostDialogHintUI = React.memo(function PostDialogHintUI(props: PostDialogHintUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    return (
        <Card className={classes.root} elevation={0}>
            <div className={classes.content}>
                <Typography className={classes.title} variant="h4">
                    {t('post_modal_hint__title')}
                </Typography>
                <Button
                    className={classes.button}
                    variant="contained"
                    onClick={props.onHintButtonClicked}
                    data-testid="hint_button">
                    {t('post_modal_hint__button')}
                </Button>
            </div>
        </Card>
    )
})

export interface PostDialogHintProps extends Partial<PostDialogHintUIProps> {
    NotSetupYetPromptProps?: Partial<BannerProps>
}
export function PostDialogHint(props: PostDialogHintProps) {
    const identities = useMyIdentities()
    const connecting = useValueRef(currentSetupGuideStatus[getActivatedUI().networkIdentifier])
    if (connecting) return null
    if (identities.length === 0) return <NotSetupYetPrompt {...props.NotSetupYetPromptProps} />
    return <PostDialogHintUI onHintButtonClicked={() => {}} {...props} />
}
