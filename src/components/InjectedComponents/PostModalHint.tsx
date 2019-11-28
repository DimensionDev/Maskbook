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
    title: {},
    button: {},
})

export interface PostModalHintUIProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onHintButtonClicked: () => void
}
export const PostModalHintUI = React.memo(function PostModalHintUI(props: PostModalHintUIProps) {
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

export interface PostModalHintProps extends Partial<PostModalHintUIProps> {}
export function PostModalHint(props: PostModalHintProps) {
    return (
        <>
            <PostModalHintUI onHintButtonClicked={() => {}} {...props} />
        </>
    )
}
