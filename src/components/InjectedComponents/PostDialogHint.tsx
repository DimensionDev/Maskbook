import * as React from 'react'
import { Box, Card, Typography, Button } from '@material-ui/core'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { useStylesExtends, or } from '../custom-ui-helper'
import { useMyIdentities } from '../DataSource/useActivatedUI'
import { Profile } from '../../database'
import { ChooseIdentity, ChooseIdentityProps } from '../shared/ChooseIdentity'
import { getActivatedUI } from '../../social-network/ui'
import { useAsync } from '../../utils/components/AsyncComponent'
import { BannerProps } from '../Welcomes/Banner'
import { NotSetupYetPrompt } from '../shared/NotSetupYetPrompt'

const useStyles = makeStyles({
    root: {},
    content: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 12px',
    },
    title: {},
    button: {},
})

export interface PostDialogHintUIProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onHintButtonClicked: () => void
}
export const PostDialogHintUI = React.memo(function PostDialogHintUI(props: PostDialogHintUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    return (
        <Card className={classes.root} elevation={0}>
            <Box className={classes.content}>
                <Typography className={classes.title} variant="h4">
                    {geti18nString('post_modal_hint__title')}
                </Typography>
                <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={props.onHintButtonClicked}>
                    {geti18nString('post_modal_hint__button')}
                </Button>
            </Box>
        </Card>
    )
})

export interface PostDialogHintProps extends Partial<PostDialogHintUIProps> {
    identities?: Profile[]
    ChooseIdentityProps?: Partial<ChooseIdentityProps>
    NotSetupYetPromptProps?: Partial<BannerProps>
}
export function PostDialogHint(props: PostDialogHintProps) {
    const identities = or(props.identities, useMyIdentities())
    const ui = <PostDialogHintUI onHintButtonClicked={() => {}} {...props} />

    const [showWelcome, setShowWelcome] = React.useState(false)
    useAsync(getActivatedUI().shouldDisplayWelcome, []).then(x => setShowWelcome(x))
    if (showWelcome || identities.length === 0) {
        return <NotSetupYetPrompt {...props.NotSetupYetPromptProps} />
    }
    if (identities.length > 1) {
        return (
            <>
                <ChooseIdentity {...props.ChooseIdentityProps} />
                {ui}
            </>
        )
    }
    return ui
}
