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
    Box,
    Chip,
    ThemeProvider,
    Theme,
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
import { RedPacketTokenType } from '../../plugins/Wallet/database/types'
import { isDAI } from '../../plugins/Wallet/erc20'
import { PluginRedPacketTheme } from '../../plugins/Wallet/theme'

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
        | 'root'
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
    theme?: Theme
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
        <div ref={rootRef} className={classes.root}>
            <ThemeProvider theme={props.theme ?? {}}>
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
                                label={`A Red Packet with $${formatBalance(
                                    BigInt(r.total),
                                    r.token?.decimals || 18,
                                )} ${r.token?.name || 'ETH'} from ${r.sender.name}`}
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
                        <Box>
                            <SelectRecipientsUI
                                disabled={props.onlyMyself || props.shareToEveryone}
                                items={props.availableShareTarget}
                                selected={props.currentShareTarget}
                                onSetSelected={props.onSetSelected}
                                {...props.SelectRecipientsUIProps}
                            />
                            <ClickableChip
                                checked={props.onlyMyself}
                                ChipProps={{
                                    label: geti18nString('post_dialog__select_recipients_only_myself'),
                                    onClick: () => props.onOnlyMyselfChanged(!props.onlyMyself),
                                }}
                            />
                            <ClickableChip
                                checked={props.shareToEveryone}
                                ChipProps={{
                                    label: geti18nString('post_dialog__select_recipients_share_to_everyone'),
                                    onClick: () => props.onShareToEveryoneChanged(!props.shareToEveryone),
                                }}
                            />
                        </Box>
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
            </ThemeProvider>
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
                const metadata = readTypedMessageMetadata(props.typedMessageMetadata, 'com.maskbook.red_packet:1')
                if (isSteganography) {
                    const isEth = metadata.ok && metadata.val.token_type === RedPacketTokenType.eth
                    const isDai =
                        metadata.ok &&
                        metadata.val.token_type === RedPacketTokenType.erc20 &&
                        metadata.val.token_type &&
                        metadata.val.token &&
                        isDAI(metadata.val.token)
                    activeUI.taskPasteIntoPostBox(
                        geti18nString('additional_post_box__steganography_post_pre', String(Date.now())),
                        {
                            warningText: geti18nString('additional_post_box__encrypted_failed'),
                            shouldOpenPostDialog: false,
                        },
                    )
                    activeUI.taskUploadToPostBox(encrypted, {
                        template: isEth ? 'eth' : isDai ? 'dai' : 'default',
                        warningText: geti18nString('additional_post_box__steganography_post_failed'),
                    })
                } else {
                    let text = geti18nString('additional_post_box__encrypted_post_pre', encrypted)
                    if (metadata.ok) {
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

    const hasRedPacket = readTypedMessageMetadata(postBoxContent.meta || new Map(), 'com.maskbook.red_packet:1').ok
    const theme = hasRedPacket ? PluginRedPacketTheme : undefined

    const mustSelectShareToEveryone = hasRedPacket && !shareToEveryone
    React.useEffect(() => {
        if (mustSelectShareToEveryone) onShareToEveryoneChanged(true)
    }, [mustSelectShareToEveryone, onShareToEveryoneChanged])
    //#endregion

    return (
        <PostDialogUI
            open={open}
            theme={theme}
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
            {...props}
            classes={{ ...props.classes }}
        />
    )
}

PostDialog.defaultProps = {
    reason: 'timeline',
}
