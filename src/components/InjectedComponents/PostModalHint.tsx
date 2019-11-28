import * as React from 'react'
import { Box, Card, Typography, Button } from '@material-ui/core'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles({
    root: {},
    content: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 12px',
    },
    caption: {},
    button: {},
})

export interface PostModalHintUIProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    hintButtonClicked: () => void
}
export const PostModalHintUI = React.memo(function PostModalHintUI(props: PostModalHintUIProps) {
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Card className={classes.root} elevation={0}>
            <Box className={classes.content}>
                <Typography className={classes.caption} variant="caption">
                    {geti18nString('post_modal_hint_title')}
                </Typography>
                <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={props.hintButtonClicked}>
                    {geti18nString('post_modal_hint_button')}
                </Button>
            </Box>
        </Card>
    )
})

export interface PostModalHintProps extends Partial<PostModalHintUIProps> {}
export function PostModalHint(props: PostModalHintProps) {
    return (
        <>
            <PostModalHintUI hintButtonClicked={() => alert('Clicked')} {...props} />
        </>
    )
}
