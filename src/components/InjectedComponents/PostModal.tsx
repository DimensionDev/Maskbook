import { memo, useState, useMemo, useCallback, useEffect, useRef } from 'react'
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
    IconButton,
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
import { SelectRecipientsUI, SelectRecipientsProps } from '../shared/SelectRecipients/SelectRecipients'

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
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backdrop: {},
    root: {
        outline: 'none',
        width: 598,
        backgroundColor: theme.palette.background.paper,
    },
    header: {},
    content: {},
    close: {},
    title: {
        marginLeft: 6,
    },
    button: {},
}))

export interface PostModalUIProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    open: boolean
    availableShareTarget: Array<Person | Group>
    currentShareTarget: Array<Person | Group>
    currentIdentity: Person | null
    postBoxText: string
    postBoxButtonDisabled: boolean
    onPostTextChange: (nextString: string) => void
    onCloseButtonClicked: () => void
    onFinishButtonClicked: () => void
    onShareTargetChanged: SelectRecipientsProps['onSetSelected']
    ChooseIdentityProps?: Partial<ChooseIdentityProps>
    SelectPeopleAndGroupsProps?: Partial<SelectRecipientsProps>
}
export const PostModalUI = memo(function PostModalUI(props: PostModalUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
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
                BackdropProps={{
                    className: classes.backdrop,
                }}
                onEscapeKeyDown={props.onCloseButtonClicked}
                onBackdropClick={props.onCloseButtonClicked}>
                <Card className={classes.root}>
                    <CardHeader
                        className={classes.header}
                        title={
                            <>
                                <IconButton
                                    classes={{ root: classes.close }}
                                    aria-label={geti18nString('post_modal__dismiss_aria')}
                                    onClick={props.onCloseButtonClicked}>
                                    <CloseIcon />
                                </IconButton>
                                <Typography className={classes.title} display="inline" variant="h6">
                                    {geti18nString('post_modal__title')}
                                </Typography>
                            </>
                        }></CardHeader>
                    <CardContent className={classes.content}>
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
                        <Typography style={{ marginBottom: 10 }}>
                            {geti18nString('post_modal__select_recipients_title')}
                        </Typography>
                        <SelectRecipientsUI
                            ignoreMyself
                            items={props.availableShareTarget}
                            selected={props.currentShareTarget}
                            onSetSelected={props.onShareTargetChanged}
                            {...props.SelectPeopleAndGroupsProps}
                        />
                    </CardContent>
                    <CardActions>
                        <Button
                            className={classes.button}
                            style={{ marginLeft: 'auto' }}
                            color="primary"
                            variant="contained"
                            disabled={props.postBoxButtonDisabled}
                            onClick={props.onFinishButtonClicked}>
                            {geti18nString('post_modal__button')}
                        </Button>
                    </CardActions>
                </Card>
            </Modal>
        </div>
    )
})

export interface PostModalProps extends Partial<PostModalUIProps> {
    identities?: Person[]
    onRequestPost?: (target: (Person | Group)[], text: string) => void
    onRequestReset?: () => void
}
export function PostModal(props: PostModalProps) {
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
    const onFinishButtonClicked = useCallback(() => {
        onRequestPost(currentShareTarget, postBoxText)
        onRequestReset()
    }, [currentShareTarget, onRequestPost, onRequestReset, postBoxText])
    const onCloseButtonClicked = useCallback(() => {
        setOpen(false)
    }, [])

    const ui = (
        <PostModalUI
            open={open}
            availableShareTarget={availableShareTarget}
            currentIdentity={currentIdentity}
            currentShareTarget={currentShareTarget}
            postBoxText={postBoxText}
            postBoxButtonDisabled={!(currentShareTarget.length && postBoxText)}
            onPostTextChange={setPostBoxText}
            onFinishButtonClicked={onFinishButtonClicked}
            onCloseButtonClicked={onCloseButtonClicked}
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
