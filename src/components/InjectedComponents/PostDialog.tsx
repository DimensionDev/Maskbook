import * as React from 'react'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
    makeStyles,
    InputBase,
    Button,
    Typography,
    IconButton,
    withMobileDialog,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { geti18nString } from '../../utils/i18n'
import { MessageCenter, CompositionEvent } from '../../utils/messages'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { useStylesExtends, or } from '../custom-ui-helper'
import { Profile, Group } from '../../database'
import { useFriendsList, useGroupsList, useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { steganographyModeSetting } from '../shared-settings/settings'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../social-network/ui'
import Services from '../../extension/service'
import { SelectRecipientsUI, SelectRecipientsUIProps } from '../shared/SelectRecipients/SelectRecipients'

const useStyles = makeStyles(theme => ({
    MUIInputRoot: {
        minHeight: 108,
        flexDirection: 'column',
        padding: 10,
        boxSizing: 'border-box',
    },
    MUIInputInput: {
        minHeight: '8em',
    },
    dialog: {},
    backdrop: {},
    paper: {},
    header: {},
    content: {},
    actions: {},
    close: {},
    title: {
        marginLeft: 6,
    },
    button: {},
}))
const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)

export interface PostDialogUIProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    open: boolean
    availableShareTarget: Array<Profile | Group>
    currentShareTarget: Array<Profile | Group>
    currentIdentity: Profile | null
    postBoxText: string
    postBoxButtonDisabled: boolean
    onPostTextChanged: (nextString: string) => void
    onFinishButtonClicked: () => void
    onCloseButtonClicked: () => void
    onSetSelected: SelectRecipientsUIProps['onSetSelected']
    SelectRecipientsUIProps?: Partial<SelectRecipientsUIProps>
}
export function PostDialogUI(props: PostDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    useCapturedInput(inputRef, props.onPostTextChanged, [props.open])
    return (
        <div ref={rootRef}>
            <ResponsiveDialog
                className={classes.dialog}
                open={props.open}
                scroll="paper"
                fullWidth
                maxWidth="sm"
                container={() => rootRef.current}
                disablePortal
                disableAutoFocus
                disableEnforceFocus
                onEscapeKeyDown={props.onCloseButtonClicked}
                BackdropProps={{
                    className: classes.backdrop,
                }}
                PaperProps={{
                    className: classes.paper,
                }}>
                <DialogTitle className={classes.header}>
                    <IconButton
                        classes={{ root: classes.close }}
                        aria-label={geti18nString('post_dialog__dismiss_aria')}
                        onClick={props.onCloseButtonClicked}>
                        <CloseIcon />
                    </IconButton>
                    <Typography className={classes.title} display="inline" variant="inherit">
                        {geti18nString('post_dialog__title')}
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <InputBase
                        classes={{
                            root: classes.MUIInputRoot,
                            input: classes.MUIInputInput,
                        }}
                        autoFocus
                        value={props.postBoxText}
                        inputRef={inputRef}
                        fullWidth
                        multiline
                        placeholder={geti18nString('post_dialog__placeholder')}
                    />
                    <Typography style={{ marginBottom: 10 }}>
                        {geti18nString('post_dialog__select_recipients_title')}
                    </Typography>
                    <SelectRecipientsUI
                        items={props.availableShareTarget}
                        selected={props.currentShareTarget}
                        onSetSelected={props.onSetSelected}
                        {...props.SelectRecipientsUIProps}
                    />
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <Button
                        className={classes.button}
                        style={{ marginLeft: 'auto' }}
                        color="primary"
                        variant="contained"
                        disabled={props.postBoxButtonDisabled}
                        onClick={props.onFinishButtonClicked}>
                        {geti18nString('post_dialog__button')}
                    </Button>
                </DialogActions>
            </ResponsiveDialog>
        </div>
    )
}

export interface PostDialogProps extends Partial<PostDialogUIProps> {
    reason?: 'timeline' | 'popup'
    identities?: Profile[]
    onRequestPost?: (target: (Profile | Group)[], text: string) => void
    onRequestReset?: () => void
}
export function PostDialog(props: PostDialogProps) {
    const people = useFriendsList()
    const groups = useGroupsList()
    const availableShareTarget = or(
        props.availableShareTarget,
        useMemo(() => [...groups, ...people], [people, groups]),
    )
    const currentIdentity = or(props.currentIdentity, useCurrentIdentity())
    const isSteganography = useValueRef(steganographyModeSetting)

    const onRequestPost = or(
        props.onRequestPost,
        useCallback(
            async (target: (Profile | Group)[], text: string) => {
                const [encrypted, token] = await Services.Crypto.encryptTo(
                    text,
                    target.map(x => x.identifier),
                    currentIdentity!.identifier,
                )
                const activeUI = getActivatedUI()
                if (isSteganography) {
                    activeUI.taskPasteIntoPostBox(geti18nString('additional_post_box__steganography_post_pre'), {
                        warningText: geti18nString('additional_post_box__encrypted_failed'),
                        shouldOpenPostDialog: false,
                    })
                    activeUI.taskUploadToPostBox(encrypted, {
                        warningText: geti18nString('additional_post_box__steganography_post_failed'),
                    })
                } else {
                    activeUI.taskPasteIntoPostBox(geti18nString('additional_post_box__encrypted_post_pre', encrypted), {
                        warningText: geti18nString('additional_post_box__encrypted_failed'),
                        shouldOpenPostDialog: false,
                    })
                }
                Services.Crypto.publishPostAESKey(token)
            },
            [currentIdentity, isSteganography],
        ),
    )
    const onRequestReset = or(
        props.onRequestReset,
        useCallback(() => {
            setOpen(false)
            setPostBoxText('')
            setCurrentShareTarget([])
        }, []),
    )

    const identities = useMyIdentities()
    const [open, setOpen] = useState(false)
    useEffect(() => {
        const onChange = ({ reason, open }: CompositionEvent) => {
            if (reason === props.reason && identities.length > 0) {
                setOpen(open)
            }
        }
        MessageCenter.on('compositionUpdated', onChange)
        return () => {
            MessageCenter.off('compositionUpdated', onChange)
        }
    }, [identities.length, props.reason])

    const [postBoxText, setPostBoxText] = useState('')
    const [currentShareTarget, setCurrentShareTarget] = useState(availableShareTarget)
    const onFinishButtonClicked = useCallback(() => {
        onRequestPost(currentShareTarget, postBoxText)
        onRequestReset()
    }, [currentShareTarget, onRequestPost, onRequestReset, postBoxText])
    const onCloseButtonClicked = useCallback(() => {
        setOpen(false)
    }, [])

    return (
        <PostDialogUI
            open={open}
            availableShareTarget={availableShareTarget}
            currentIdentity={currentIdentity}
            currentShareTarget={currentShareTarget}
            postBoxText={postBoxText}
            postBoxButtonDisabled={!(currentShareTarget.length && postBoxText)}
            onSetSelected={setCurrentShareTarget}
            onPostTextChanged={setPostBoxText}
            onFinishButtonClicked={onFinishButtonClicked}
            onCloseButtonClicked={onCloseButtonClicked}
            {...props}
        />
    )
}

PostDialog.defaultProps = {
    reason: 'timeline',
}
