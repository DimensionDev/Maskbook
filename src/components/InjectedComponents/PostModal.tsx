import * as React from 'react'
import {
    Card,
    Modal,
    CardHeader,
    CardContent,
    makeStyles,
    InputBase,
    CardActions,
    Button,
    Typography,
} from '@material-ui/core'
import { geti18nString } from '../../utils/i18n'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles(theme => ({
    MUIInputRoot: {
        minHeight: 108,
        flexDirection: 'column',
        padding: 12,
        boxSizing: 'border-box',
    },
    MUIInputInput: {
        minHeight: '8em',
    },
    root: {
        outline: 'none',
        width: 598,
        backgroundColor: theme.palette.background.paper,
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {},
    button: {},
}))

export interface PostModalUIProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    open: boolean
    postBoxText: string
    postBoxButtonDisabled: boolean
    onPostTextChange: (nextString: string) => void
    onCloseButtonClicked: () => void
    onFinishButtonClicked: () => void
}
export const PostModalUI = React.memo(function PostModalUI(props: PostModalUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    useCapturedInput(inputRef, props.onPostTextChange)
    return (
        <div ref={rootRef}>
            <Modal
                className={classes.modal}
                open={props.open}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                disablePortal
                disableAutoFocus
                disableEnforceFocus
                container={() => rootRef.current}
                onEscapeKeyDown={props.onCloseButtonClicked}
                onBackdropClick={props.onCloseButtonClicked}>
                <Card className={classes.root}>
                    <CardHeader className={classes.title} title={geti18nString('post_modal__title')}></CardHeader>
                    <CardContent>
                        <InputBase
                            classes={{
                                root: classes.MUIInputRoot,
                                input: classes.MUIInputInput,
                            }}
                            value={props.postBoxText}
                            inputRef={inputRef}
                            fullWidth
                            multiline
                            placeholder={geti18nString('post_modal__placeholder')}
                        />
                        <Typography className={classes.title}>
                            {geti18nString('post_modal__select_recipients_title')}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button
                            className={classes.button}
                            style={{ marginLeft: 'auto' }}
                            variant="contained"
                            color="primary"
                            onClick={props.onFinishButtonClicked}>
                            {geti18nString('post_modal__button')}
                        </Button>
                    </CardActions>
                </Card>
            </Modal>
        </div>
    )
})

export interface PostModalProps
    extends PartialRequired<PostModalUIProps, 'open' | 'postBoxText' | 'onPostTextChange'> {}
export function PostModal(props: PostModalProps) {
    return (
        <>
            <PostModalUI
                postBoxButtonDisabled={false}
                onCloseButtonClicked={() => {}}
                onFinishButtonClicked={() => {}}
                {...props}
            />
        </>
    )
}
