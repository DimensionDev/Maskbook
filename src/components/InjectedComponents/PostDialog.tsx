import * as React from 'react'
import { useState, useMemo, useCallback, useEffect } from 'react'
import {
    makeStyles,
    InputBase,
    Button,
    Typography,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Chip,
    ThemeProvider,
    Theme,
    DialogProps,
    Tooltip,
    CircularProgressProps,
    CircularProgress,
} from '@material-ui/core'
import { MessageCenter, CompositionEvent } from '../../utils/messages'
import { useStylesExtends, or } from '../custom-ui-helper'
import type { Profile, Group } from '../../database'
import { useFriendsList, useCurrentGroupsList, useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { currentImagePayloadStatus } from '../../settings/settings'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../social-network/ui'
import Services from '../../extension/service'
import { SelectRecipientsUI, SelectRecipientsUIProps } from '../shared/SelectRecipients/SelectRecipients'
import { DialogDismissIconUI } from './DialogDismissIcon'
import { ClickableChip } from '../shared/SelectRecipients/ClickableChip'
import RedPacketDialog from '../../plugins/RedPacket/UI/RedPacketDialog'
import FileServiceDialog from '../../plugins/FileService/MainDialog'
import FileServiceEntryIcon from './FileServiceEntryIcon'
import {
    TypedMessage,
    extractTextFromTypedMessage,
    renderWithMetadataUntyped,
    makeTypedMessageText,
    isTypedMessageText,
} from '../../protocols/typed-message'
import { EthereumTokenType } from '../../web3/types'
import { isDAI, isOKB } from '../../web3/helpers'
import { PluginRedPacketTheme } from '../../plugins/RedPacket/theme'
import { useI18N } from '../../utils/i18n-next-ui'
import ShadowRootDialog from '../../utils/shadow-root/ShadowRootDialog'
import { twitterUrl } from '../../social-network-provider/twitter.com/utils/url'
import { RedPacketMetadataReader } from '../../plugins/RedPacket/helpers'
import { PluginUI } from '../../plugins/plugin'
import { Flags } from '../../utils/flags'
import PollsDialog from '../../plugins/Polls/UI/PollsDialog'

const defaultTheme = {}

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
    imagePayload: boolean
    maxLength?: number
    availableShareTarget: Array<Profile | Group>
    currentShareTarget: Array<Profile | Group>
    currentIdentity: Profile | null
    postContent: TypedMessage
    postBoxButtonDisabled: boolean
    onPostContentChanged: (nextMessage: TypedMessage) => void
    onOnlyMyselfChanged: (checked: boolean) => void
    onShareToEveryoneChanged: (checked: boolean) => void
    onImagePayloadSwitchChanged: (checked: boolean) => void
    onFinishButtonClicked: () => void
    onCloseButtonClicked: () => void
    onSetSelected: SelectRecipientsUIProps['onSetSelected']
    DialogProps?: Partial<DialogProps>
    SelectRecipientsUIProps?: Partial<SelectRecipientsUIProps>
}
export function PostDialogUI(props: PostDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()
    const onPostContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const newText = e.target.value
        const msg = props.postContent
        if (isTypedMessageText(msg)) props.onPostContentChanged(makeTypedMessageText(newText, msg.meta))
        else throw new Error('Not impled yet')
    }
    const [redPacketDialogOpen, setRedPacketDialogOpen] = useState(false)
    const [fileServiceDialogOpen, setFileServiceDialogOpen] = useState(false)
    const [pollsDialogOpen, setPollsDialogOpen] = useState(false)

    if (!isTypedMessageText(props.postContent)) return <>Unsupported type to edit</>
    const metadataBadge = [...PluginUI].flatMap((plugin) => {
        const knownMeta = plugin.postDialogMetadataBadge
        if (!knownMeta) return undefined
        return [...knownMeta.entries()].map(([metadataKey, tag]) => {
            return renderWithMetadataUntyped(props.postContent.meta, metadataKey, (r) => (
                <Box key={metadataKey} marginRight={1} marginTop={1} display="inline-block">
                    <Tooltip title={`Provided by plugin "${plugin.pluginName}"`}>
                        <Chip
                            onDelete={() => {
                                const ref = getActivatedUI().typedMessageMetadata
                                const next = new Map(ref.value.entries())
                                next.delete(metadataKey)
                                ref.value = next
                            }}
                            label={tag(r)}
                        />
                    </Tooltip>
                </Box>
            ))
        })
    })
    return (
        <div className={classes.root}>
            <ThemeProvider theme={props.theme ?? defaultTheme}>
                <ShadowRootDialog
                    className={classes.dialog}
                    classes={{
                        container: classes.container,
                        paper: classes.paper,
                    }}
                    open={props.open}
                    scroll="paper"
                    fullWidth
                    maxWidth="sm"
                    disableAutoFocus
                    disableEnforceFocus
                    onEscapeKeyDown={props.onCloseButtonClicked}
                    BackdropProps={{
                        className: classes.backdrop,
                    }}
                    {...props.DialogProps}>
                    <DialogTitle className={classes.header}>
                        <IconButton
                            classes={{ root: classes.close }}
                            aria-label={t('post_dialog__dismiss_aria')}
                            onClick={props.onCloseButtonClicked}>
                            <DialogDismissIconUI />
                        </IconButton>
                        <Typography className={classes.title} display="inline" variant="inherit">
                            {t('post_dialog__title')}
                        </Typography>
                    </DialogTitle>
                    <DialogContent className={classes.content}>
                        {metadataBadge}
                        <InputBase
                            classes={{
                                root: classes.MUIInputRoot,
                                input: classes.MUIInputInput,
                            }}
                            autoFocus
                            value={props.postContent.content}
                            onChange={onPostContentChange}
                            fullWidth
                            multiline
                            placeholder={t('post_dialog__placeholder')}
                            inputProps={{ className: classes.input, 'data-testid': 'text_textarea' }}
                        />

                        <Typography style={{ marginBottom: 10 }}>Plugins (Experimental)</Typography>
                        <Box style={{ marginBottom: 10 }} display="flex" flexWrap="wrap">
                            <ClickableChip
                                ChipProps={{
                                    label: '💰 Red Packet',
                                    onClick: async () => {
                                        const wallets = await Services.Plugin.invokePlugin(
                                            'maskbook.wallet',
                                            'getWallets',
                                        )
                                        if (wallets.length) setRedPacketDialogOpen(true)
                                        else Services.Provider.requestConnectWallet()
                                    },
                                }}
                            />
                            {Flags.file_service_create_enabled && (
                                <ClickableChip
                                    ChipProps={{
                                        label: (
                                            <>
                                                <FileServiceEntryIcon width={16} height={16} />
                                                &nbsp;File Service
                                            </>
                                        ),
                                        onClick() {
                                            setFileServiceDialogOpen(true)
                                        },
                                    }}
                                />
                            )}
                            <ClickableChip
                                ChipProps={{
                                    label: '🗳️ Poll',
                                    onClick: () => {
                                        setPollsDialogOpen(true)
                                    },
                                }}
                            />
                        </Box>
                        <Typography style={{ marginBottom: 10 }}>
                            {t('post_dialog__select_recipients_title')}
                        </Typography>
                        <Box style={{ marginBottom: 10 }} display="flex" flexWrap="wrap">
                            <SelectRecipientsUI
                                disabled={props.onlyMyself || props.shareToEveryone}
                                items={props.availableShareTarget}
                                selected={props.currentShareTarget}
                                onSetSelected={props.onSetSelected}
                                {...props.SelectRecipientsUIProps}>
                                <ClickableChip
                                    checked={props.shareToEveryone}
                                    ChipProps={{
                                        'data-testid': '_everyone_group_',
                                        disabled: props.onlyMyself,
                                        label: t('post_dialog__select_recipients_share_to_everyone'),
                                        onClick: () => props.onShareToEveryoneChanged(!props.shareToEveryone),
                                    }}
                                />
                                <ClickableChip
                                    checked={props.onlyMyself}
                                    ChipProps={{
                                        'data-testid': '_only_myself_group_',
                                        disabled: props.shareToEveryone,
                                        label: t('post_dialog__select_recipients_only_myself'),
                                        onClick: () => props.onOnlyMyselfChanged(!props.onlyMyself),
                                    }}
                                />
                            </SelectRecipientsUI>
                        </Box>
                        {Flags.no_post_image_payload_support ? null : (
                            <>
                                <Typography style={{ marginBottom: 10 }}>
                                    {t('post_dialog__more_options_title')}
                                </Typography>
                                <Box style={{ marginBottom: 10 }} display="flex" flexWrap="wrap">
                                    <ClickableChip
                                        checked={props.imagePayload}
                                        ChipProps={{
                                            label: t('post_dialog__image_payload'),
                                            onClick: () => props.onImagePayloadSwitchChanged(!props.imagePayload),
                                            'data-testid': 'image_chip',
                                        }}
                                    />
                                </Box>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        {isTypedMessageText(props.postContent) && props.maxLength ? (
                            <CharLimitIndicator value={props.postContent.content.length} max={props.maxLength} />
                        ) : null}
                        <Button
                            className={classes.button}
                            variant="contained"
                            disabled={props.postBoxButtonDisabled}
                            onClick={props.onFinishButtonClicked}
                            data-testid="finish_button">
                            {t('post_dialog__button')}
                        </Button>
                    </DialogActions>
                </ShadowRootDialog>
            </ThemeProvider>
            {!process.env.STORYBOOK && (
                <RedPacketDialog
                    classes={classes}
                    open={props.open && redPacketDialogOpen}
                    onConfirm={() => setRedPacketDialogOpen(false)}
                    onDecline={() => setRedPacketDialogOpen(false)}
                    DialogProps={props.DialogProps}
                />
            )}
            {Flags.file_service_create_enabled && (
                <FileServiceDialog
                    classes={classes}
                    open={props.open && fileServiceDialogOpen}
                    onConfirm={() => setFileServiceDialogOpen(false)}
                    onDecline={() => setFileServiceDialogOpen(false)}
                    DialogProps={props.DialogProps}
                />
            )}
            {!process.env.STORYBOOK && (
                <PollsDialog
                    classes={classes}
                    open={props.open && pollsDialogOpen}
                    onConfirm={() => setPollsDialogOpen(false)}
                    onDecline={() => setPollsDialogOpen(false)}
                    DialogProps={props.DialogProps}
                />
            )}
        </div>
    )
}

export interface PostDialogProps extends Omit<Partial<PostDialogUIProps>, 'open'> {
    open?: [boolean, (next: boolean) => void]
    reason?: 'timeline' | 'popup'
    identities?: Profile[]
    onRequestPost?: (target: (Profile | Group)[], content: TypedMessage) => void
    onRequestReset?: () => void
    typedMessageMetadata?: ReadonlyMap<string, any>
}
export function PostDialog({ reason: props_reason = 'timeline', ...props }: PostDialogProps) {
    const { t, i18n } = useI18N()
    const [onlyMyselfLocal, setOnlyMyself] = useState(false)
    const onlyMyself = props.onlyMyself ?? onlyMyselfLocal
    const [shareToEveryoneLocal, setShareToEveryone] = useState(true)
    const shareToEveryone = props.shareToEveryone ?? shareToEveryoneLocal
    const typedMessageMetadata = or(props.typedMessageMetadata, useValueRef(getActivatedUI().typedMessageMetadata))
    const [open, setOpen] = or(props.open, useState<boolean>(false)) as NonNullable<PostDialogProps['open']>

    //#region TypedMessage
    const [postBoxContent, setPostBoxContent] = useState<TypedMessage>(makeTypedMessageText('', typedMessageMetadata))
    useEffect(() => {
        if (typedMessageMetadata !== postBoxContent.meta)
            setPostBoxContent({ ...postBoxContent, meta: typedMessageMetadata })
    }, [typedMessageMetadata, postBoxContent])
    //#endregion
    //#region Share target
    const people = useFriendsList()
    const groups = useCurrentGroupsList()
    const availableShareTarget = or(
        props.availableShareTarget,
        useMemo(() => [...groups, ...people], [people, groups]),
    )
    const currentIdentity = or(props.currentIdentity, useCurrentIdentity())
    const [currentShareTarget, setCurrentShareTarget] = useState<(Profile | Group)[]>(() => [])
    //#endregion
    //#region Image Based Payload Switch
    const imagePayloadStatus = useValueRef(currentImagePayloadStatus[getActivatedUI().networkIdentifier])
    const imagePayloadEnabled = imagePayloadStatus === 'true'
    const onImagePayloadSwitchChanged = or(
        props.onImagePayloadSwitchChanged,
        useCallback((checked) => {
            currentImagePayloadStatus[getActivatedUI().networkIdentifier].value = String(checked)
        }, []),
    )
    //#endregion
    //#region callbacks
    const onRequestPost = or(
        props.onRequestPost,
        useCallback(
            async (target: (Profile | Group)[], content: TypedMessage) => {
                const [encrypted, token] = await Services.Crypto.encryptTo(
                    content,
                    target.map((x) => x.identifier),
                    currentIdentity!.identifier,
                    !!shareToEveryone,
                )
                const activeUI = getActivatedUI()
                // TODO: move into the plugin system
                const metadata = RedPacketMetadataReader(typedMessageMetadata)
                if (imagePayloadEnabled) {
                    const isRedPacket = metadata.ok && metadata.val.rpid
                    const isErc20 =
                        metadata.ok &&
                        metadata.val &&
                        metadata.val.token &&
                        metadata.val.token_type === EthereumTokenType.ERC20
                    const isDai = isErc20 && metadata.ok && isDAI(metadata.val.token?.address ?? '')
                    const isOkb = isErc20 && metadata.ok && isOKB(metadata.val.token?.address ?? '')

                    const relatedText = t('additional_post_box__steganography_post_pre', {
                        random: new Date().toLocaleString(),
                    })
                    activeUI.taskPasteIntoPostBox(relatedText, {
                        shouldOpenPostDialog: false,
                        autoPasteFailedRecover: false,
                    })
                    activeUI.taskUploadToPostBox(encrypted, {
                        template: isRedPacket ? (isDai ? 'dai' : isOkb ? 'okb' : 'eth') : 'v2',
                        autoPasteFailedRecover: true,
                        relatedText,
                    })
                } else {
                    let text = t('additional_post_box__encrypted_post_pre', { encrypted })
                    if (metadata.ok) {
                        if (i18n.language?.includes('zh')) {
                            text =
                                activeUI.networkIdentifier === twitterUrl.hostIdentifier
                                    ? `用 #Maskbook @realMaskbook 開啟紅包 ${encrypted}`
                                    : `用 #Maskbook 開啟紅包 ${encrypted}`
                        } else {
                            text =
                                activeUI.networkIdentifier === twitterUrl.hostIdentifier
                                    ? `Claim this Red Packet with #Maskbook @realMaskbook ${encrypted}`
                                    : `Claim this Red Packet with #Maskbook ${encrypted}`
                        }
                    }
                    activeUI.taskPasteIntoPostBox(text, {
                        autoPasteFailedRecover: true,
                        shouldOpenPostDialog: false,
                    })
                }
                // This step write data on gun.
                // there is nothing to write if it shared with public
                if (!shareToEveryone) Services.Crypto.publishPostAESKey(token)
            },
            [currentIdentity, shareToEveryone, typedMessageMetadata, imagePayloadEnabled, t, i18n.language],
        ),
    )
    const onRequestReset = or(
        props.onRequestReset,
        useCallback(() => {
            setOpen(false)
            setOnlyMyself(false)
            setShareToEveryone(false)
            setPostBoxContent(makeTypedMessageText(''))
            setCurrentShareTarget([])
            getActivatedUI().typedMessageMetadata.value = new Map()
        }, [setOpen]),
    )
    const onFinishButtonClicked = useCallback(() => {
        onRequestPost(onlyMyself ? [currentIdentity!] : currentShareTarget, postBoxContent)
        onRequestReset()
    }, [currentIdentity, currentShareTarget, onRequestPost, onRequestReset, onlyMyself, postBoxContent])
    const onCloseButtonClicked = useCallback(() => {
        setOpen(false)
    }, [setOpen])
    //#endregion
    //#region My Identity
    const identities = useMyIdentities()
    useEffect(() => {
        return MessageCenter.on('compositionUpdated', ({ reason, open, content, options }: CompositionEvent) => {
            if (reason !== props_reason || identities.length <= 0) return
            setOpen(open)
            if (content) setPostBoxContent(makeTypedMessageText(content))
            if (options?.onlyMySelf) setOnlyMyself(true)
            if (options?.shareToEveryOne) setShareToEveryone(true)
        })
    }, [identities.length, props_reason, setOpen])

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
    //#endregion

    //#region Red Packet
    // TODO: move into the plugin system
    const hasRedPacket = RedPacketMetadataReader(postBoxContent.meta).ok
    const theme = hasRedPacket ? PluginRedPacketTheme : undefined
    const mustSelectShareToEveryone = hasRedPacket && !shareToEveryone

    useEffect(() => {
        if (mustSelectShareToEveryone) onShareToEveryoneChanged(true)
    }, [mustSelectShareToEveryone, onShareToEveryoneChanged])
    //#endregion
    const isPostButtonDisabled = !(() => {
        const text = extractTextFromTypedMessage(postBoxContent)
        if (text.ok && text.val.length > 560) return false
        return onlyMyself || shareToEveryoneLocal ? text.val : currentShareTarget.length && text
    })()

    return (
        <PostDialogUI
            theme={theme}
            shareToEveryone={shareToEveryoneLocal}
            onlyMyself={onlyMyself}
            availableShareTarget={availableShareTarget}
            imagePayload={imagePayloadEnabled}
            currentIdentity={currentIdentity}
            currentShareTarget={currentShareTarget}
            postContent={postBoxContent}
            postBoxButtonDisabled={isPostButtonDisabled}
            maxLength={560}
            onSetSelected={setCurrentShareTarget}
            onPostContentChanged={setPostBoxContent}
            onShareToEveryoneChanged={onShareToEveryoneChanged}
            onOnlyMyselfChanged={onOnlyMyselfChanged}
            onImagePayloadSwitchChanged={onImagePayloadSwitchChanged}
            onFinishButtonClicked={onFinishButtonClicked}
            onCloseButtonClicked={onCloseButtonClicked}
            {...props}
            open={open}
            classes={{ ...props.classes }}
        />
    )
}
export function CharLimitIndicator({ value, max, ...props }: CircularProgressProps & { value: number; max: number }) {
    const displayLabel = max - value < 40
    const normalized = Math.min((value / max) * 100, 100)
    const style = { transitionProperty: 'transform,width,height,color' } as React.CSSProperties
    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress
                variant="static"
                value={normalized}
                color={displayLabel ? 'secondary' : 'primary'}
                size={displayLabel ? void 0 : 16}
                {...props}
                style={value >= max ? { color: 'red', ...style, ...props.style } : { ...style, ...props.style }}
            />
            {displayLabel ? (
                <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center">
                    <Typography variant="caption" component="div" color="textSecondary">
                        {max - value}
                    </Typography>
                </Box>
            ) : null}
        </Box>
    )
}
