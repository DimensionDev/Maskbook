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
    Box,
    Chip,
} from '@material-ui/core'
import { geti18nString, getCurrentLanguage } from '../../utils/i18n'
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
import { ClickableChip } from '../shared/SelectRecipients/ClickableChip'
import RedPacketDialog from '../../plugins/Wallet/UI/RedPacket/RedPacketDialog'
import {
    makeTypedMessage,
    TypedMessage,
    withMetadata,
    readTypedMessageMetadata,
} from '../../extension/background-script/CryptoServices/utils'
import { formatBalance } from '../../plugins/Wallet/formatter'
import classNames from 'classnames'

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
    hasRedPacket: {
        '& > .MuiDialog-root': {
            '& .MuiDialog-paper': {
                backgroundColor: 'rgb(219,6,50) !important',
                color: 'white !important',
                position: 'relative',
                '&::after': {
                    position: 'absolute',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='56' height='80' viewBox='0 0 56 80' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M41.112 23.4988H63.5149C64.3482 23.4988 65.0145 24.2426 65.0248 25.1588V36.4782C65.0244 37.3951 64.3485 38.1382 63.5149 38.1382H1.50948C0.676073 38.1379 0.000455383 37.3949 0 36.4782V25.1592C0.000455383 24.2425 0.676073 23.4995 1.50948 23.4993H23.5407C17.7879 20.3617 10.3201 14.7456 11.5647 7.05925C11.6332 6.73569 12.7602 2.14331 16.1806 0.547772C18.2095 -0.411546 20.5218 -0.10932 23.0403 1.44265C23.952 2.00309 26.3823 4.39639 27.4215 6.07815C28.9891 8.60078 31.1941 12.5143 32.6153 16.632C33.9388 12.3632 36.2515 7.51168 40.2201 5.54948C41.0629 5.14016 43.8265 4.78438 45.062 5.17283C45.9923 5.46371 47.7081 6.13215 48.6685 7.2748C50.1676 9.06411 50.9028 11.059 50.8042 13.0421C50.6866 15.2198 49.6086 17.3004 47.5707 19.23C47.5117 19.284 47.4527 19.3375 47.3838 19.3811C46.8653 19.7473 44.0328 21.6773 41.112 23.4988ZM29.9986 79.1999H5.17487C4.34162 79.1994 3.66626 78.4565 3.6658 77.5399V41.447C3.66626 40.5305 4.34162 39.7875 5.17487 39.787H29.999C30.8322 39.7875 31.5076 40.5305 31.5081 41.447V77.5499C31.5081 78.4556 30.8315 79.1994 29.9986 79.1994V79.1999ZM59.8891 79.1999H35.3496C34.5164 79.1994 33.841 78.4565 33.8406 77.5399V41.447C33.841 40.5305 34.5164 39.7875 35.3496 39.787H59.8891C60.7223 39.7875 61.3977 40.5305 61.3982 41.447V77.5499C61.3982 78.4556 60.722 79.1994 59.8891 79.1994V79.1999ZM14.4851 7.77032L14.4877 7.76083C14.5396 7.56666 15.3543 4.52168 17.3469 3.5986C17.7289 3.41527 18.1505 3.32905 18.601 3.32905C19.4735 3.32905 20.4632 3.66304 21.561 4.34237C22.0507 4.64414 24.1286 6.67078 24.9223 7.96454C26.7156 10.8429 30.7338 17.8717 30.9982 23.3586C30.9112 23.2946 30.8055 23.2523 30.6994 23.2098L30.6994 23.2098L30.6946 23.2079C25.7845 21.4504 13.2896 15.2629 14.4851 7.77077V7.77032ZM43.6701 8.32005C42.9251 8.32005 41.7786 8.45982 41.4156 8.6005H41.416C36.8785 10.8422 34.7618 19.2946 34.1442 23.4985H34.3793C36.7118 22.6576 43.1998 18.3566 45.6887 16.6422C47.0216 15.3488 47.737 14.0764 47.7955 12.8584C47.8545 11.7807 47.4036 10.6594 46.4535 9.52759C46.1887 9.21493 45.3851 8.72983 44.2287 8.36316C44.1111 8.33094 43.9053 8.32005 43.6701 8.32005Z' fill='url(%23paint0_linear)'/%3E%3Cdefs%3E%3ClinearGradient id='paint0_linear' x1='32.5124' y1='-39.5999' x2='-45.172' y2='24.1806' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FFFDDC'/%3E%3Cstop offset='1' stop-color='%23DAB26A'/%3E%3Cstop offset='1' stop-color='%23DAB26A'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E%0A")`,
                    width: '4em',
                    height: '5.7em',
                    top: 250,
                    right: 0,
                    opacity: 0.8,
                    backgroundAttachment: 'local',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    content: '""',
                },
            },
            '& .MuiDialogTitle-root': {
                borderBottom: '1px solid rgba(199,26,57) !important',
            },
            '& .MuiChip-root': {
                '&:hover': {
                    backgroundColor: 'rgb(240,60,60) !important',
                },
                '& .MuiChip-deleteIcon': {
                    color: 'rgba(255, 255, 255, 0.46) !important',
                    '&:hover': {
                        color: 'rgba(255, 255, 255, 0.8) !important',
                    },
                },
                '& .MuiChip-avatar': {
                    color: 'rgba(255, 255, 255, 0.8) !important',
                },
                backgroundColor: 'rgb(192,20,56) !important',
                color: 'white !important',
            },
            '& .MuiIconButton-label': {
                color: 'white !important',
            },
            '& .MuiSwitch-thumb': {
                color: 'white !important',
            },
            '& .MuiSwitch-colorPrimary.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'white !important',
            },
            '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)!important',
            },
            '& .MuiButton-containedPrimary': {
                backgroundColor: 'white!important',
                '& *': {
                    color: 'rgb(219,6,50) !important',
                },
            },
        },
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
    shareToEveryone: boolean
    availableShareTarget: Array<Profile | Group>
    currentShareTarget: Array<Profile | Group>
    currentIdentity: Profile | null
    postContent: TypedMessage
    postBoxButtonDisabled: boolean
    onPostContentChanged: (nextMessage: TypedMessage) => void
    onOnlyMyselfChanged: (checked: boolean) => void
    onShareToEveryoneChanged: (checked: boolean) => void
    onFinishButtonClicked: () => void
    onCloseButtonClicked: () => void
    onSetSelected: SelectRecipientsUIProps['onSetSelected']
    SelectRecipientsUIProps?: Partial<SelectRecipientsUIProps>
    rootStyleOverrides?: string
}
export function PostDialogUI(props: PostDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = useRef<HTMLDivElement>(null)
    const [, inputRef] = useCapturedInput(
        newText => {
            const msg = props.postContent
            if (msg.type === 'text') props.onPostContentChanged(makeTypedMessage(newText, msg.meta))
            else throw new Error('Not impled yet')
        },
        [props.open, props.postContent],
    )
    const [redPacketDialogOpen, setRedPacketDialogOpen] = useState(false)
    if (props.postContent.type !== 'text') return <>Unsupported type to edit</>
    return (
        <div ref={rootRef} className={props.rootStyleOverrides}>
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
                    {withMetadata(props.postContent.meta, 'com.maskbook.red_packet:1', r => (
                        <Chip
                            onDelete={() => {
                                const ref = getActivatedUI().typedMessageMetadata
                                const next = new Map(ref.value.entries())
                                next.delete('com.maskbook.red_packet:1')
                                ref.value = next
                            }}
                            label={`A Red Packet with $${formatBalance(BigInt(r.total), r.token?.decimals || 18)} ${r
                                .token?.name || 'ETH'} from ${r.sender.name}`}
                        />
                    ))}
                    <InputBase
                        classes={{
                            root: classes.MUIInputRoot,
                            input: classes.MUIInputInput,
                        }}
                        inputProps={{ className: classes.input }}
                        autoFocus
                        value={props.postContent.content}
                        inputRef={inputRef}
                        fullWidth
                        multiline
                        placeholder={geti18nString('post_dialog__placeholder')}
                    />
                    <Typography style={{ marginBottom: 10 }}>Plugins (Experimental)</Typography>
                    <Box style={{ marginBottom: 10 }} display="flex" flexWrap="wrap">
                        <ClickableChip
                            ChipProps={{
                                label: '💰 Red Packet',
                                onClick: () => setRedPacketDialogOpen(true),
                            }}
                        />
                    </Box>
                    <Typography style={{ marginBottom: 10 }}>
                        {geti18nString('post_dialog__select_recipients_title')}
                    </Typography>
                    <SelectRecipientsUI
                        disabled={props.onlyMyself || props.shareToEveryone}
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
                        onChange={(_, checked) => props.onOnlyMyselfChanged(checked)}
                    />
                    <FormControlLabel
                        classes={{ label: classes.label }}
                        label={geti18nString('post_dialog__select_recipients_share_to_everyone')}
                        control={<Switch className={classes.switch} color="primary" checked={props.shareToEveryone} />}
                        onChange={(_, checked) => props.onShareToEveryoneChanged(checked)}
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
            <RedPacketDialog
                classes={classes}
                open={props.open && redPacketDialogOpen}
                onConfirm={() => setRedPacketDialogOpen(false)}
                onDecline={() => setRedPacketDialogOpen(false)}
            />
        </div>
    )
}

export interface PostDialogProps extends Partial<PostDialogUIProps> {
    reason?: 'timeline' | 'popup'
    identities?: Profile[]
    onRequestPost?: (target: (Profile | Group)[], content: TypedMessage) => void
    onRequestReset?: () => void
    typedMessageMetadata: ReadonlyMap<string, any>
}
export function PostDialog(props: PostDialogProps) {
    const classes = useStyles()
    const [onlyMyselfLocal, setOnlyMyself] = useState(false)
    const onlyMyself = props.onlyMyself ?? onlyMyselfLocal
    const [shareToEveryoneLocal, setShareToEveryone] = useState(false)
    const shareToEveryone = props.shareToEveryone ?? shareToEveryoneLocal

    const isSteganography = useValueRef(steganographyModeSetting)
    //#region TypedMessage
    const [postBoxContent, setPostBoxContent] = useState<TypedMessage>(makeTypedMessage('', props.typedMessageMetadata))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (props.typedMessageMetadata !== postBoxContent.meta)
            setPostBoxContent({ ...postBoxContent, meta: props.typedMessageMetadata })
    }, [props.typedMessageMetadata, postBoxContent])
    //#endregion
    //#region Share target
    const people = useFriendsList()
    const groups = useGroupsList()
    const availableShareTarget = or(
        props.availableShareTarget,
        useMemo(() => [...groups, ...people], [people, groups]),
    )
    const currentIdentity = or(props.currentIdentity, useCurrentIdentity())
    const [currentShareTarget, setCurrentShareTarget] = useState(availableShareTarget)
    //#endregion
    //#region callbacks
    const onRequestPost = or(
        props.onRequestPost,
        useCallback(
            async (target: (Profile | Group)[], content: TypedMessage) => {
                const [encrypted, token] = await Services.Crypto.encryptTo(
                    content,
                    target.map(x => x.identifier),
                    currentIdentity!.identifier,
                    !!shareToEveryone,
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
                    let text = geti18nString('additional_post_box__encrypted_post_pre', encrypted)
                    if (readTypedMessageMetadata(props.typedMessageMetadata, 'com.maskbook.red_packet:1').hasValue) {
                        if (getCurrentLanguage() === 'zh') {
                            text =
                                '春節快樂，用 Maskbook 開啟 Twitter 上第一個紅包！ （僅限 Twitter web 版）#MakerDAO #Maskbook 用@realMaskbook 解密 ' +
                                encrypted
                        } else {
                            text =
                                'Happy Chinese New Year and use Maskbook to receive the first Twitter Red Packet. (Only available on Twitter for web) #MakerDAO #Maskbook Decrypt with @realMaskbook ' +
                                encrypted
                        }
                    }
                    activeUI.taskPasteIntoPostBox(text, {
                        warningText: geti18nString('additional_post_box__encrypted_failed'),
                        shouldOpenPostDialog: false,
                    })
                }
                // This step write data on gun.
                // there is nothing to write if it shared with public
                if (!shareToEveryone) Services.Crypto.publishPostAESKey(token)
            },
            [currentIdentity, isSteganography, props.typedMessageMetadata, shareToEveryone],
        ),
    )
    const onRequestReset = or(
        props.onRequestReset,
        useCallback(() => {
            setOpen(false)
            setPostBoxContent(makeTypedMessage(''))
            setCurrentShareTarget([])
            getActivatedUI().typedMessageMetadata.value = new Map()
        }, []),
    )
    const onFinishButtonClicked = useCallback(() => {
        onRequestPost(onlyMyself ? [currentIdentity!] : currentShareTarget, postBoxContent)
        onRequestReset()
    }, [currentIdentity, currentShareTarget, onRequestPost, onRequestReset, onlyMyself, postBoxContent])
    const onCloseButtonClicked = useCallback(() => {
        setOpen(false)
    }, [])
    //#endregion
    //#region My Identity
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

    const onOnlyMyselfChanged = or(
        props.onOnlyMyselfChanged,
        useCallback((checked: boolean) => {
            setOnlyMyself(checked)
            checked && setShareToEveryone(false)
        }, []),
    )
    const onShareToEveryoneChanged = or(
        props.onShareToEveryoneChanged,
        useCallback((checked: boolean) => {
            setShareToEveryone(checked)
            checked && setOnlyMyself(false)
        }, []),
    )

    const hasRedPacket = readTypedMessageMetadata(postBoxContent.meta || new Map(), 'com.maskbook.red_packet:1')
        .hasValue

    const mustSelectShareToEveryone = hasRedPacket && !shareToEveryone
    React.useEffect(() => {
        if (mustSelectShareToEveryone) onShareToEveryoneChanged(true)
    }, [mustSelectShareToEveryone, onShareToEveryoneChanged])
    //#endregion

    return (
        <PostDialogUI
            open={open}
            shareToEveryone={shareToEveryoneLocal}
            onlyMyself={onlyMyself}
            availableShareTarget={availableShareTarget}
            currentIdentity={currentIdentity}
            currentShareTarget={currentShareTarget}
            postContent={postBoxContent}
            postBoxButtonDisabled={
                !(onlyMyself || shareToEveryoneLocal ? postBoxContent : currentShareTarget.length && postBoxContent)
            }
            onSetSelected={setCurrentShareTarget}
            onPostContentChanged={setPostBoxContent}
            onShareToEveryoneChanged={onShareToEveryoneChanged}
            onOnlyMyselfChanged={onOnlyMyselfChanged}
            onFinishButtonClicked={onFinishButtonClicked}
            onCloseButtonClicked={onCloseButtonClicked}
            rootStyleOverrides={classNames({ [classes.hasRedPacket]: hasRedPacket })}
            {...props}
        />
    )
}

PostDialog.defaultProps = {
    reason: 'timeline',
}
