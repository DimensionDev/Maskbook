import React from 'react'
import { useRef, useState, useCallback, useEffect } from 'react'
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
    MenuItem,
    Divider,
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { MessageCenter, CompositionEvent } from '../../utils/messages'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { useStylesExtends, or } from '../custom-ui-helper'
import type { Profile, Group } from '../../database'
import {
    useFriendsList,
    useGroupsList,
    useCurrentIdentity,
    useMyIdentities,
    useCurrentGroupsList,
} from '../DataSource/useActivatedUI'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../social-network/ui'
import Services from '../../extension/service'
import { DialogDismissIconUI } from './DialogDismissIcon'
import { ClickableChip } from '../shared/SelectRecipients/ClickableChip'
import RedPacketDialog from '../../plugins/Wallet/UI/RedPacket/RedPacketDialog'
import {
    TypedMessage,
    readTypedMessageMetadata,
    extractTextFromTypedMessage,
    withMetadataUntyped,
    makeTypedMessageText,
} from '../../extension/background-script/CryptoServices/utils'
import { EthereumTokenType } from '../../plugins/Wallet/database/types'
import { isDAI, isOKB } from '../../plugins/Wallet/token'
import { PluginRedPacketTheme } from '../../plugins/Wallet/theme'
import { useI18N } from '../../utils/i18n-next-ui'
import ShadowRootDialog from '../../utils/jss/ShadowRootDialog'
import { twitterUrl } from '../../social-network-provider/twitter.com/utils/url'
import { RedPacketMetaKey } from '../../plugins/Wallet/RedPacketMetaKey'
import { PluginUI } from '../../plugins/plugin'
import { PostDialogDropdown } from './PostDialogDropdown'

import { resolveSpecialGroupName } from '../shared/SelectPeopleAndGroups/resolveSpecialGroupName'
import { currentPayloadType } from '../../settings/settings'
import { SelectRecipientsDialog, SelectRecipientsDialogProps } from '../shared/SelectRecipients/SelectRecipientsDialog'
import { difference } from 'lodash-es'
import { ProfileIdentifier, GroupIdentifier } from '../../database/type'

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
    header: {
        display: 'flex',
    },
    title: {
        '& > h2': {
            display: 'flex',
            alignItems: 'center',
            width: '100%',
        },
    },
    text: {
        marginLeft: 6,
        flex: 1,
    },
    actions: {
        paddingLeft: 26,
    },
})

type PayloadType = 'image' | 'text'
type RecipientType = 'anyone' | 'myself' | 'group_friends'

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
    groups: Array<Group>
    profiles: Array<Profile>
    recipients: Array<Profile | Group>
    postContent: TypedMessage
    postBoxButtonDisabled: boolean
    payloadType: PayloadType
    recipientType: RecipientType
    onSetSelected: (selected: Array<Group | Profile>) => void
    onPostContentChanged: (nextMessage: TypedMessage) => void
    onPayloadTypeChanged: (type: PayloadType) => void
    onRecipientTypeChanged: (type: RecipientType) => void
    onSubmit: () => void
    onClose: () => void
    DialogProps?: Partial<DialogProps>
    SelectRecipientsDialogProps?: Partial<SelectRecipientsDialogProps>
}
export function PostDialogUI(props: PostDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()
    const [, inputRef] = useCapturedInput(
        (newText) => {
            const msg = props.postContent
            if (msg.type === 'text') props.onPostContentChanged(makeTypedMessageText(newText, msg.meta))
            else throw new Error('Not impled yet')
        },
        [props.open, props.postContent],
    )

    //#region red packet dialog
    const [redPacketDialogOpen, setRedPacketDialogOpen] = useState(false)
    //#endregion

    //#region select recipient dialog
    const [selectRecipientDialogOpen, setSelectRecipientDialogOpen] = useState(false)
    const selectedRecipients = props.recipients.filter((x) => isProfile(x)) as Profile[]
    //#endregion

    //#region payload type
    const payloadSwitchRef = useRef<HTMLButtonElement | null>(null)
    const [payloadDropmenuOpen, setPayloadDropmenuOpen] = useState(false)
    const payloadDropmenuItems = [
        webpackEnv.target !== 'WKWebview' && webpackEnv.firefoxVariant !== 'android' ? (
            <MenuItem onClick={() => props.onPayloadTypeChanged('image')}>🖼️ Image Payload</MenuItem>
        ) : null,
        <MenuItem onClick={() => props.onPayloadTypeChanged('text')}>📒 Text Payload</MenuItem>,
    ].filter(Boolean) as JSX.Element[]
    const resolvedPayloadTypeName = (() => {
        switch (props.payloadType) {
            case 'image':
                return t('post_dialog__payload_menu_image')
            case 'text':
                return t('post_dialog__payload_menu_text')
            default:
                return ''
        }
    })()
    //#endregion

    //#region recipient type
    const recipientSwitchRef = useRef<HTMLButtonElement | null>(null)
    const [recipientDropmenuOpen, setRecipientDropmenuOpen] = useState(false)
    const recipientDropmenuItems = [
        <MenuItem onClick={() => props.onRecipientTypeChanged('anyone')}>Anyone on Maskbook</MenuItem>,
        <MenuItem onClick={() => props.onRecipientTypeChanged('myself')}>Only myself</MenuItem>,
        ...props.groups.map((group) => (
            <MenuItem
                onClick={() => {
                    props.onSetSelected([...selectedRecipients, group])
                    props.onRecipientTypeChanged('group_friends')
                }}>
                {resolveSpecialGroupName(t, (group as any) as Group, props.profiles)}
            </MenuItem>
        )),
        <MenuItem
            disabled={props.recipientType === 'anyone' || props.recipientType === 'myself'}
            onClick={() => setSelectRecipientDialogOpen(true)}>
            Specific Friends ({selectedRecipients.length} selected) <AddIcon />
        </MenuItem>,
    ]
    const resolvedRecipientTypeName = (() => {
        switch (props.recipientType) {
            case 'anyone':
                return t('post_dialog__recipient_anyone')
            case 'myself':
                return t('post_dialog__recipient_myself')
            case 'group_friends':
                return t('post_dialog__recipient_group', {
                    group: resolveSpecialGroupName(
                        t,
                        props.recipients.find((x) => isGroup(x)) as Group,
                        props.profiles,
                    ),
                })
            default:
                return ''
        }
    })()
    //#endregion

    const onDropmenuRootClick = (ev: React.MouseEvent<HTMLElement>) => {
        const target = ev.target as HTMLElement
        if (payloadDropmenuOpen && !payloadSwitchRef.current?.contains(target)) setPayloadDropmenuOpen(false)
        if (recipientDropmenuOpen && !recipientSwitchRef.current?.contains(target)) setRecipientDropmenuOpen(false)
    }

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
        <div className={classes.root} onClick={onDropmenuRootClick}>
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
                    onEscapeKeyDown={props.onClose}
                    BackdropProps={{
                        className: classes.backdrop,
                    }}
                    {...props.DialogProps}>
                    <DialogTitle className={classes.header} classes={{ root: classes.title }}>
                        <IconButton
                            classes={{ root: classes.close }}
                            aria-label={t('post_dialog__dismiss_aria')}
                            onClick={props.onClose}>
                            <DialogDismissIconUI />
                        </IconButton>
                        <Typography className={classes.text} variant="inherit" component="div">
                            {t('post_dialog__title')}
                        </Typography>
                        <Button ref={payloadSwitchRef} variant="text" onClick={() => setPayloadDropmenuOpen((p) => !p)}>
                            {resolvedPayloadTypeName}
                            <ArrowDropDownIcon />
                        </Button>
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
                        <Divider />
                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        <Box display="flex" flexDirection="column" alignItems="flex-start">
                            <Button
                                ref={recipientSwitchRef}
                                variant="text"
                                onClick={() => setRecipientDropmenuOpen((p) => !p)}>
                                {resolvedRecipientTypeName}
                                <ArrowDropDownIcon />
                            </Button>
                            {/* <Typography>
                                Not posting as
                                <Button size="small">xxx</Button>?
                            </Typography> */}
                        </Box>
                        <Button
                            className={classes.button}
                            style={{ marginLeft: 'auto' }}
                            color="primary"
                            variant="contained"
                            disabled={props.postBoxButtonDisabled}
                            onClick={props.onSubmit}
                            data-testid="finish_button">
                            {t('post_dialog__button')}
                        </Button>
                    </DialogActions>
                    <PostDialogDropdown
                        open={payloadDropmenuOpen}
                        anchorRef={payloadSwitchRef}
                        items={payloadDropmenuItems}
                        onClose={() => setPayloadDropmenuOpen(false)}
                    />
                    <PostDialogDropdown
                        title={t('post_dialog__recipient_menu_title')}
                        open={recipientDropmenuOpen}
                        anchorRef={recipientSwitchRef}
                        items={recipientDropmenuItems}
                        onClose={() => setRecipientDropmenuOpen(false)}
                    />
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
            <SelectRecipientsDialog
                open={selectRecipientDialogOpen}
                items={props.profiles}
                selected={selectedRecipients}
                disabledItems={[]}
                onSubmit={() => setSelectRecipientDialogOpen(false)}
                onClose={() => setSelectRecipientDialogOpen(false)}
                onSelect={(x) => props.onSetSelected([...props.recipients, x])}
                onDeselect={(x) => props.onSetSelected(difference(props.recipients, [x]))}
                DialogProps={props.DialogProps}
                {...props.SelectRecipientsDialogProps}
            />
        </div>
    )
}

export interface PostDialogProps extends Omit<Partial<PostDialogUIProps>, 'open'> {
    open?: [boolean, (next: boolean) => void]
    reason?: 'timeline' | 'popup'
    identities?: Profile[]
    currentIdentity?: Profile | null
    onRequestPost?: (target: (Profile | Group)[], content: TypedMessage) => void
    onRequestReset?: () => void
    typedMessageMetadata?: ReadonlyMap<string, any>
}
export function PostDialog(props: PostDialogProps) {
    const { t, i18n } = useI18N()
    const typedMessageMetadata = or(props.typedMessageMetadata, useValueRef(getActivatedUI().typedMessageMetadata))
    const [open, setOpen] = or(props.open, useState<boolean>(false)) as NonNullable<PostDialogProps['open']>

    //#region TypedMessage
    const [postBoxContent, setPostBoxContent] = useState<TypedMessage>(makeTypedMessageText('', typedMessageMetadata))
    useEffect(() => {
        if (typedMessageMetadata !== postBoxContent.meta)
            setPostBoxContent({ ...postBoxContent, meta: typedMessageMetadata })
    }, [typedMessageMetadata, postBoxContent])
    //#endregion

    //#region share target
    const currentIdentity = or(props.currentIdentity, useCurrentIdentity())
    const [currentShareTarget, setCurrentShareTarget] = useState<(Profile | Group)[]>(() => [])
    const profiles = useFriendsList().filter(
        (x) => isProfile(x) && !x.identifier.equals(currentIdentity?.identifier) && x.linkedPersona?.fingerprint,
    )
    const groups = useCurrentGroupsList()
    //#endregion

    //#region recipient type
    const [recipientType, setRecipientType] = useState<RecipientType>('anyone')
    const onlyMyself = recipientType === 'myself'
    const shareToEveryone = recipientType === 'anyone'
    //#endregion

    //#region payload type
    const payloadType = useValueRef(currentPayloadType[getActivatedUI().networkIdentifier])
    const imagePayloadEnabled = payloadType === 'image'
    const onPayloadTypeChanged = or(
        props.onPayloadTypeChanged,
        useCallback((type) => {
            currentPayloadType[getActivatedUI().networkIdentifier].value = type
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
            setRecipientType('anyone')
            setPostBoxContent(makeTypedMessageText(''))
            setCurrentShareTarget([])
            getActivatedUI().typedMessageMetadata.value = new Map()
        }, [setOpen]),
    )
    const onSubmit = useCallback(() => {
        onRequestPost(onlyMyself ? [currentIdentity!] : currentShareTarget, postBoxContent)
        onRequestReset()
    }, [currentIdentity, currentShareTarget, onRequestPost, onRequestReset, onlyMyself, postBoxContent])
    const onClose = useCallback(() => {
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
    //#endregion

    //#region Red Packet
    // TODO: move into the plugin system
    const hasRedPacket = readTypedMessageMetadata(postBoxContent.meta, RedPacketMetaKey).ok
    const theme = hasRedPacket ? PluginRedPacketTheme : undefined
    const mustSelectShareToEveryone = hasRedPacket && !shareToEveryone

    useEffect(() => {
        if (mustSelectShareToEveryone) setRecipientType('anyone')
    }, [mustSelectShareToEveryone, setRecipientType])
    //#endregion

    return (
        <PostDialogUI
            theme={theme}
            groups={groups}
            profiles={profiles}
            recipients={currentShareTarget}
            postContent={postBoxContent}
            postBoxButtonDisabled={
                !(onlyMyself || shareToEveryone
                    ? extractTextFromTypedMessage(postBoxContent).val
                    : currentShareTarget.length && extractTextFromTypedMessage(postBoxContent).val)
            }
            payloadType={payloadType}
            recipientType={recipientType}
            onSetSelected={setCurrentShareTarget}
            onPostContentChanged={setPostBoxContent}
            onPayloadTypeChanged={onPayloadTypeChanged}
            onRecipientTypeChanged={setRecipientType}
            onSubmit={onSubmit}
            onClose={onClose}
            {...props}
            open={open}
            classes={{ ...props.classes }}
        />
    )
}

PostDialog.defaultProps = {
    reason: 'timeline',
}

export function isProfile(x: Profile | Group): x is Profile {
    return x.identifier instanceof ProfileIdentifier
}
export function isGroup(x: Profile | Group): x is Group {
    return x.identifier instanceof GroupIdentifier
}
