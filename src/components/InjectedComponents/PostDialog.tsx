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
} from '@material-ui/core'
import Jimp from 'jimp'
import type JimpT from 'jimp'
var toBuffer = require('typedarray-to-buffer') // TODO: !
import { MessageCenter, CompositionEvent } from '../../utils/messages'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { useStylesExtends, or } from '../custom-ui-helper'
import type { Profile, Group } from '../../database'
import { useFriendsList, useGroupsList, useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { currentImagePayloadStatus, currentImageEncryptStatus } from '../../settings/settings'
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
    readTypedMessageMetadata,
    extractTextFromTypedMessage,
    withMetadataUntyped,
} from '../../extension/background-script/CryptoServices/utils'
import { EthereumTokenType } from '../../plugins/Wallet/database/types'
import { isDAI, isOKB } from '../../plugins/Wallet/token'
import { PluginRedPacketTheme } from '../../plugins/Wallet/theme'
import { useI18N } from '../../utils/i18n-next-ui'
import ShadowRootDialog from '../../utils/jss/ShadowRootDialog'
import { twitterUrl } from '../../social-network-provider/twitter.com/utils/url'
import {
    shuffle,
    uploadShuffleToPostBoxFacebook,
} from '../../social-network-provider/facebook.com/tasks/uploadToPostBox'
import { RedPacketMetaKey } from '../../plugins/Wallet/RedPacketMetaKey'
import { PluginUI } from '../../plugins/plugin'
import Dropzone from '../shared/Dropzone'

const defaultTheme = {}

const DEFAULT_BLOCK_WIDTH = 8

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
    imageEncrypt: boolean
    availableShareTarget: Array<Profile | Group>
    currentShareTarget: Array<Profile | Group>
    currentIdentity: Profile | null
    postContent: TypedMessage
    onImgChange: (img: File) => Promise<void>
    postBoxButtonDisabled: boolean
    onPostContentChanged: (nextMessage: TypedMessage) => void
    onOnlyMyselfChanged: (checked: boolean) => void
    onShareToEveryoneChanged: (checked: boolean) => void
    onImagePayloadSwitchChanged: (checked: boolean) => void
    onImageEncryptSwitchChanged: (checked: boolean) => void
    onFinishButtonClicked: () => void
    onCloseButtonClicked: () => void
    onSetSelected: SelectRecipientsUIProps['onSetSelected']
    DialogProps?: Partial<DialogProps>
    SelectRecipientsUIProps?: Partial<SelectRecipientsUIProps>
}

// TODO: you will want to move this elsewhere
const readFileAsync: (file: File) => Promise<ArrayBuffer | null> = (file: File) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(null)
            } else {
                resolve(reader.result)
            }
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
    })
}

export function PostDialogUI(props: PostDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()
    const [, inputRef] = useCapturedInput(
        (newText) => {
            const msg = props.postContent
            if (msg.type === 'text') props.onPostContentChanged(makeTypedMessage(newText, msg.meta))
            else throw new Error('Not impled yet')
        },
        [props.open, props.postContent],
    )
    const [redPacketDialogOpen, setRedPacketDialogOpen] = useState(false)

    if (props.postContent.type !== 'text') return <>Unsupported type to edit</>
    const metadataBadge = [...PluginUI].flatMap((plugin) => {
        const knownMeta = plugin.postDialogMetadataBadge
        if (!knownMeta) return undefined
        return [...knownMeta.entries()].map(([metadataKey, tag]) => {
            return withMetadataUntyped(props.postContent.meta, metadataKey, (r) => (
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
                            inputRef={inputRef}
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
                                        const { wallets } = await Services.Plugin.getWallets()
                                        if (wallets.length) setRedPacketDialogOpen(true)
                                        else Services.Provider.requestConnectWallet()
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
                                        disabled: props.onlyMyself,
                                        label: t('post_dialog__select_recipients_share_to_everyone'),
                                        onClick: () => props.onShareToEveryoneChanged(!props.shareToEveryone),
                                    }}
                                />
                                <ClickableChip
                                    checked={props.onlyMyself}
                                    ChipProps={{
                                        disabled: props.shareToEveryone,
                                        label: t('post_dialog__select_recipients_only_myself'),
                                        onClick: () => props.onOnlyMyselfChanged(!props.onlyMyself),
                                    }}
                                />
                            </SelectRecipientsUI>
                        </Box>
                        {/* This feature is not ready for mobile version */}
                        {webpackEnv.target !== 'WKWebview' && webpackEnv.firefoxVariant !== 'android' ? (
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
                                            disabled: props.imageEncrypt,
                                        }}
                                    />
                                    <ClickableChip
                                        checked={props.imageEncrypt}
                                        ChipProps={{
                                            label: t('post_dialog__image_encrypt'),
                                            onClick: () => props.onImageEncryptSwitchChanged(!props.imageEncrypt),
                                            'data-testid': 'image_encrypt_chip',
                                            disabled: props.imagePayload,
                                        }}
                                    />
                                </Box>
                                <Box>{props.imageEncrypt && <Dropzone onImgChange={props.onImgChange} />}</Box>
                            </>
                        ) : null}
                    </DialogContent>
                    {/* TODO: not disabled when the image has been uploaded */}
                    <DialogActions className={classes.actions}>
                        <Button
                            className={classes.button}
                            style={{ marginLeft: 'auto' }}
                            color="primary"
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
export function PostDialog(props: PostDialogProps) {
    const { t, i18n } = useI18N()
    const [onlyMyselfLocal, setOnlyMyself] = useState(false)
    const onlyMyself = props.onlyMyself ?? onlyMyselfLocal
    const [shareToEveryoneLocal, setShareToEveryone] = useState(false)
    const shareToEveryone = props.shareToEveryone ?? shareToEveryoneLocal
    const typedMessageMetadata = or(props.typedMessageMetadata, useValueRef(getActivatedUI().typedMessageMetadata))
    const [open, setOpen] = or(props.open, useState<boolean>(false)) as NonNullable<PostDialogProps['open']>

    //#region TypedMessage
    const [postBoxContent, setPostBoxContent] = useState<TypedMessage>(makeTypedMessage('', typedMessageMetadata))
    useEffect(() => {
        if (typedMessageMetadata !== postBoxContent.meta)
            setPostBoxContent({ ...postBoxContent, meta: typedMessageMetadata })
    }, [typedMessageMetadata, postBoxContent])
    //#endregion
    //#region Share target
    const people = useFriendsList()
    const groups = useGroupsList()
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
    const imageEncryptStatus = useValueRef(currentImageEncryptStatus[getActivatedUI().networkIdentifier])
    const imageEncryptEnabled = imageEncryptStatus === 'true'
    const onImageEncryptSwitchChanged = or(
        props.onImageEncryptSwitchChanged,
        useCallback((checked) => {
            currentImageEncryptStatus[getActivatedUI().networkIdentifier].value = String(checked)
        }, []),
    )
    const [imgToEncrypt, setImgToEncrypt] = useState<JimpT | null>(null)
    const onImgChange = useCallback(async (imgFile: File) => {
        const arrayBuffer = await readFileAsync(imgFile)
        if (!arrayBuffer) {
            console.debug('empty image file')
            return
        }
        const uintArr = new Uint8Array(arrayBuffer)
        const buf = toBuffer(uintArr)
        const img = await Jimp.read(buf)
        setImgToEncrypt(img)
    }, [])
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
                    shareToEveryone,
                )
                const activeUI = getActivatedUI()
                // TODO: move into the plugin system
                const metadata = readTypedMessageMetadata(typedMessageMetadata, RedPacketMetaKey)
                if (imagePayloadEnabled) {
                    const isRedPacket = metadata.ok && metadata.val.rpid
                    const isErc20 =
                        metadata.ok &&
                        metadata.val &&
                        metadata.val.token &&
                        metadata.val.token_type === EthereumTokenType.ERC20
                    const isDai = isErc20 && metadata.ok && isDAI(metadata.val.token?.address ?? '')
                    const isOkb = isErc20 && metadata.ok && isOKB(metadata.val.token?.address ?? '')

                    activeUI.taskPasteIntoPostBox(
                        t('additional_post_box__steganography_post_pre', { random: String(Date.now()) }),
                        { shouldOpenPostDialog: false },
                    )
                    activeUI.taskUploadToPostBox(encrypted, {
                        template: isRedPacket ? (isDai ? 'dai' : isOkb ? 'okb' : 'eth') : 'v2',
                        warningText: t('additional_post_box__steganography_post_failed'),
                    })
                } else if (imageEncryptEnabled) {
                    if (!imgToEncrypt) {
                        console.debug('nothing to encrypt')
                        return
                    }
                    const seed = shuffle({ file: imgToEncrypt, blockWidth: DEFAULT_BLOCK_WIDTH })
                    const seedTypedMessage = makeTypedMessage(seed)
                    const [encrypted, _] = await Services.Crypto.encryptTo(
                        seedTypedMessage,
                        target.map((x) => x.identifier),
                        currentIdentity!.identifier,
                        // TODO: ! public share
                        true,
                    )

                    const text = t('additional_post_box__encrypted_post_pre', { encrypted })
                    activeUI.taskPasteIntoPostBox(text, {
                        warningText: t('additional_post_box__encrypted_failed'),
                        shouldOpenPostDialog: false,
                    })
                    imgToEncrypt.getBuffer(Jimp.MIME_JPEG, (_, buffer) => {
                        activeUI.taskUploadShuffleToPostBox(buffer, {
                            template: 'v2',
                            // ! not steganography failed
                            warningText: t('additional_post_box__steganography_post_failed'),
                        })
                    })
                } else {
                    let text = t('additional_post_box__encrypted_post_pre', { encrypted })
                    if (metadata.ok) {
                        if (i18n.language.includes('zh')) {
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
                        warningText: t('additional_post_box__encrypted_failed'),
                        shouldOpenPostDialog: false,
                    })
                }
                // This step writes data on gun.
                // there is nothing to write if it is shared with public
                if (!shareToEveryone) Services.Crypto.publishPostAESKey(token)
            },
            [
                currentIdentity,
                shareToEveryone,
                typedMessageMetadata,
                imagePayloadEnabled,
                imageEncryptEnabled,
                t,
                i18n.language,
                imgToEncrypt,
            ],
        ),
    )
    const onRequestReset = or(
        props.onRequestReset,
        useCallback(() => {
            setOpen(false)
            setOnlyMyself(false)
            setShareToEveryone(false)
            setPostBoxContent(makeTypedMessage(''))
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
        return MessageCenter.on('compositionUpdated', ({ reason, open }: CompositionEvent) => {
            if (reason === props.reason && identities.length > 0) {
                setOpen(open)
            }
        })
    }, [identities.length, props.reason, setOpen])

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
    const postBoxButtonDisabled = useCallback(() => {
        const allOrMe = onlyMyself || shareToEveryoneLocal
        const textFromTypedMessage = extractTextFromTypedMessage(postBoxContent).val
        const condition = allOrMe
            ? imageEncryptEnabled
                ? imgToEncrypt?.bitmap?.data
                : textFromTypedMessage
            : currentShareTarget.length && textFromTypedMessage
        return !condition
    }, [onlyMyself, shareToEveryoneLocal, currentShareTarget.length, postBoxContent, imageEncryptEnabled, imgToEncrypt])
    //#endregion
    //#region Red Packet
    // TODO: move into the plugin system
    const hasRedPacket = readTypedMessageMetadata(postBoxContent.meta, RedPacketMetaKey).ok
    const theme = hasRedPacket ? PluginRedPacketTheme : undefined
    const mustSelectShareToEveryone = hasRedPacket && !shareToEveryone

    useEffect(() => {
        if (mustSelectShareToEveryone) onShareToEveryoneChanged(true)
    }, [mustSelectShareToEveryone, onShareToEveryoneChanged])
    //#endregion

    return (
        <PostDialogUI
            theme={theme}
            shareToEveryone={shareToEveryoneLocal}
            onlyMyself={onlyMyself}
            availableShareTarget={availableShareTarget}
            imagePayload={imagePayloadEnabled}
            imageEncrypt={imageEncryptEnabled}
            currentIdentity={currentIdentity}
            currentShareTarget={currentShareTarget}
            postContent={postBoxContent}
            postBoxButtonDisabled={postBoxButtonDisabled()}
            onImgChange={onImgChange}
            onSetSelected={setCurrentShareTarget}
            onPostContentChanged={setPostBoxContent}
            onShareToEveryoneChanged={onShareToEveryoneChanged}
            onOnlyMyselfChanged={onOnlyMyselfChanged}
            onImagePayloadSwitchChanged={onImagePayloadSwitchChanged}
            onImageEncryptSwitchChanged={onImageEncryptSwitchChanged}
            onFinishButtonClicked={onFinishButtonClicked}
            onCloseButtonClicked={onCloseButtonClicked}
            {...props}
            open={open}
            classes={{ ...props.classes }}
        />
    )
}

PostDialog.defaultProps = {
    reason: 'timeline',
}
