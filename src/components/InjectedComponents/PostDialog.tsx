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
import { MessageCenter } from '../../utils/messages'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { useStylesExtends, or } from '../custom-ui-helper'
import { Person, Group } from '../../database'
import { useFriendsList, useGroupsList, useMyIdentities, useCurrentIdentity } from '../DataSource/useActivatedUI'
import { steganographyModeSetting } from '../shared-settings/settings'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../social-network/ui'
import { ChooseIdentity, ChooseIdentityProps } from '../shared/ChooseIdentity'
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
    availableShareTarget: Array<Person | Group>
    currentShareTarget: Array<Person | Group>
    currentIdentity: Person | null
    postBoxText: string
    postBoxButtonDisabled: boolean
    onPostTextChange: (nextString: string) => void
    onFinishButtonClicked: () => void
    onCloseButtonClicked: () => void
    onShareTargetChanged: SelectRecipientsUIProps['onSetSelected']
    ChooseIdentityProps?: Partial<ChooseIdentityProps>
    SelectRecipientsUIProps?: Partial<SelectRecipientsUIProps>
}
export function PostDialogUI(props: PostDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    useCapturedInput(inputRef, props.onPostTextChange, [props.open])
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
                        onSetSelected={props.onShareTargetChanged}
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
    identities?: Person[]
    onRequestPost?: (target: (Person | Group)[], text: string) => void
    onRequestReset?: () => void
}
export function PostDialog(props: PostDialogProps) {
    const people = useFriendsList()
    const groups = useGroupsList()
    const availableShareTarget = or(
        props.availableShareTarget,
        useMemo(() => [...groups, ...people], [people, groups]),
    )
    const identities = or(props.identities, useMyIdentities())
    const currentIdentity = or(props.currentIdentity, useCurrentIdentity())
    const isSteganography = useValueRef(steganographyModeSetting)

    const onRequestPost = or(
        props.onRequestPost,
        useCallback(
            async (target: (Person | Group)[], text: string) => {
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
            onShareTargetChanged([])
        }, []),
    )

    const [open, setOpen] = useState(false)
    const onStartCompose = useCallback(() => setOpen(true), [])
    const onCancelCompose = useCallback(() => setOpen(false), [])
    useEffect(() => {
        MessageCenter.on('startCompose', onStartCompose)
        MessageCenter.on('cancelCompose', onCancelCompose)
        return () => {
            MessageCenter.off('startCompose', onStartCompose)
            MessageCenter.off('cancelCompose', onCancelCompose)
        }
    }, [onStartCompose, onCancelCompose])

    const [postBoxText, setPostBoxText] = useState('')
    const [currentShareTarget, onShareTargetChanged] = useState(availableShareTarget)

    const ui = (
        <PostDialogUI
            open={open}
            availableShareTarget={availableShareTarget}
            currentIdentity={currentIdentity}
            currentShareTarget={currentShareTarget}
            postBoxText={postBoxText}
            postBoxButtonDisabled={!(currentShareTarget.length && postBoxText)}
            onPostTextChange={setPostBoxText}
            onFinishButtonClicked={() => {
                onRequestPost(currentShareTarget, postBoxText)
                onRequestReset()
            }}
            onCloseButtonClicked={() => setOpen(false)}
            onShareTargetChanged={onShareTargetChanged}
            {...props}
        />
    )

    if (identities.length > 1)
        return (
            <>
                <ChooseIdentity {...props.ChooseIdentityProps} />
                {ui}
            </>
        )
    return ui
}
