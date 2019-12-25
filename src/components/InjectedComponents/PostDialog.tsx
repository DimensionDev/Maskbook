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
    Switch,
    FormControlLabel,
} from '@material-ui/core'
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
import { DialogDismissIconUI } from './DialogDismissIcon'

const useStyles = makeStyles({
    MUIInputRoot: {
        minHeight: 108,
        flexDirection: 'column',
        padding: 10,
        boxSizing: 'border-box',
    },
    MUIInputInput: {
        fontSize: 18,
        minHeight: '8em',
    },
    title: {
        marginLeft: 6,
    },
    actions: {
        paddingLeft: 26,
    },
})
const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)

export interface PostDialogUIProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'input'
        | 'header'
        | 'content'
        | 'actions'
        | 'close'
        | 'button'
        | 'label'
        | 'switch'
    > {
    open: boolean
    onlyMyself: boolean
    availableShareTarget: Array<Profile | Group>
    currentShareTarget: Array<Profile | Group>
    currentIdentity: Profile | null
    postBoxText: string
    postBoxButtonDisabled: boolean
    onPostTextChanged: (nextString: string) => void
    onOnlyMyselfChanged: (checked: boolean) => void
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
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
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
                }}>
                <DialogTitle className={classes.header}>
                    <IconButton
                        classes={{ root: classes.close }}
                        aria-label={geti18nString('post_dialog__dismiss_aria')}
                        onClick={props.onCloseButtonClicked}>
                        <DialogDismissIconUI />
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
                        inputProps={{ className: classes.input }}
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
                        disabled={props.onlyMyself}
                        items={props.availableShareTarget}
                        selected={props.currentShareTarget}
                        onSetSelected={props.onSetSelected}
                        {...props.SelectRecipientsUIProps}
                    />
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <FormControlLabel
                        classes={{ label: classes.label }}
                        label={geti18nString('post_dialog__select_recipients_only_myself')}
                        control={<Switch className={classes.switch} color="primary" checked={props.onlyMyself} />}
                        onChange={(_: React.ChangeEvent<{}>, checked: boolean) => props.onOnlyMyselfChanged(checked)}
                    />
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
                    activeUI.taskPasteIntoPostBox(
                        geti18nString('additional_post_box__steganography_post_pre', String(Date.now())),
                        {
                            warningText: geti18nString('additional_post_box__encrypted_failed'),
                            shouldOpenPostDialog: false,
                        },
                    )
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

    const [onlyMyself, setOnlyMyself] = useState(false)
    const onOnlyMyselfChanged = useCallback((checked: boolean) => setOnlyMyself(checked), [])

    const [postBoxText, setPostBoxText] = useState('')
    const [currentShareTarget, setCurrentShareTarget] = useState(availableShareTarget)
    const onFinishButtonClicked = useCallback(() => {
        onRequestPost(onlyMyself ? [currentIdentity!] : currentShareTarget, postBoxText)
        onRequestReset()
    }, [currentIdentity, currentShareTarget, onRequestPost, onRequestReset, onlyMyself, postBoxText])
    const onCloseButtonClicked = useCallback(() => {
        setOpen(false)
    }, [])

    return (
        <PostDialogUI
            open={open}
            onlyMyself={onlyMyself}
            availableShareTarget={availableShareTarget}
            currentIdentity={currentIdentity}
            currentShareTarget={currentShareTarget}
            postBoxText={postBoxText}
            postBoxButtonDisabled={!(onlyMyself ? postBoxText : currentShareTarget.length && postBoxText)}
            onSetSelected={setCurrentShareTarget}
            onPostTextChanged={setPostBoxText}
            onOnlyMyselfChanged={onOnlyMyselfChanged}
            onFinishButtonClicked={onFinishButtonClicked}
            onCloseButtonClicked={onCloseButtonClicked}
            {...props}
        />
    )
}

PostDialog.defaultProps = {
    reason: 'timeline',
}
