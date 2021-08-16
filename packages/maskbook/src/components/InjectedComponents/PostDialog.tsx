import { useState, useCallback, useEffect } from 'react'
import {
    InputBase,
    Button,
    Typography,
    Box,
    Chip,
    DialogProps,
    Tooltip,
    CircularProgressProps,
    CircularProgress,
    DialogContent,
    DialogActions,
} from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import {
    I18NStringField,
    Plugin,
    useActivatedPluginsSNSAdaptor,
    useActivatedPluginSNSAdaptorWithOperatingChainSupportedMet,
} from '@masknet/plugin-infra'
import { useValueRef, or } from '@masknet/shared'
import { CompositionEvent, MaskMessage, useI18N, Flags } from '../../utils'
import { isMinds } from '../../social-network-adaptor/minds.com/base'
import type { Profile } from '../../database'
import { useFriendsList, useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { currentImagePayloadStatus, debugModeSetting } from '../../settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import Services from '../../extension/service'
import { SelectRecipientsUI, SelectRecipientsUIProps } from '../shared/SelectRecipients/SelectRecipients'
import { ClickableChip } from '../shared/SelectRecipients/ClickableChip'
import {
    TypedMessage,
    extractTextFromTypedMessage,
    makeTypedMessageText,
    isTypedMessageText,
} from '../../protocols/typed-message'
import { EthereumTokenType, isDAI, isOKB } from '@masknet/web3-shared'
import { RedPacketMetadataReader } from '../../plugins/RedPacket/SNSAdaptor/helpers'
import { Result } from 'ts-results'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { InjectedDialog } from '../shared/InjectedDialog'
import { DebugMetadataInspector } from '../shared/DebugMetadataInspector'
import { editActivatedPostMetadata, globalTypedMessageMetadata } from '../../protocols/typed-message/global-state'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { SteganographyTextPayload } from './SteganographyTextPayload'
import { PluginI18NFieldRender, usePluginI18NField } from '../../plugin-infra/I18NFieldRender'
import { base as redpacketBase } from '../../plugins/RedPacket/base'
import { base as ITOBase } from '../../plugins/ITO/base'

const useStyles = makeStyles()({
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
    sup: {
        paddingLeft: 2,
    },
    button: {
        zIndex: 1,
    },
})

export interface PostDialogUIProps {
    open: boolean
    onlyMyself: boolean
    shareToEveryone: boolean
    imagePayload: boolean
    imagePayloadUnchangeable: boolean
    maxLength?: number
    availableShareTarget: Array<Profile>
    currentShareTarget: Array<Profile>
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
}

export function PostDialogUI(props: PostDialogUIProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const isDebug = useValueRef(debugModeSetting)
    const [showPostMetadata, setShowPostMetadata] = useState(false)
    const [clipboardReadPermissionGranted, setClipboardReadPermissionGranted] = useState<boolean | undefined>(undefined)

    useEffect(() => {
        Services.Helper.queryPermission({ permissions: ['clipboardRead'] }).then((granted) => {
            setClipboardReadPermissionGranted(granted)
        })
    }, [])

    const requestClipboardPermission = useCallback(async () => {
        const granted = await Services.Helper.requestBrowserPermission({ permissions: ['clipboardRead'] })
        setClipboardReadPermissionGranted(Boolean(granted))
    }, [])

    const onPostContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const newText = e.target.value
        const msg = props.postContent
        if (isTypedMessageText(msg)) props.onPostContentChanged(makeTypedMessageText(newText, msg.meta))
        else throw new Error('Not impled yet')
    }

    if (!isTypedMessageText(props.postContent)) return <>Unsupported type to edit</>
    return (
        <InjectedDialog open={props.open} onClose={props.onCloseButtonClicked} title={t('post_dialog__title')}>
            <DialogContent>
                <BadgeRenderer meta={props.postContent.meta} />
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
                    inputProps={{ 'data-testid': 'text_textarea' }}
                />

                <Typography style={{ marginBottom: 10 }}>
                    Plugins <sup>(Experimental)</sup>
                </Typography>
                <Box
                    style={{ marginBottom: 10 }}
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                    }}>
                    <PluginRenderer />
                </Box>
                <Typography style={{ marginBottom: 10 }}>{t('post_dialog__select_recipients_title')}</Typography>
                <Box
                    style={{ marginBottom: 10 }}
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                    }}>
                    <SelectRecipientsUI
                        items={props.availableShareTarget}
                        selected={props.currentShareTarget}
                        onSetSelected={props.onSetSelected}>
                        <ClickableChip
                            checked={props.shareToEveryone}
                            label={t('post_dialog__select_recipients_share_to_everyone')}
                            data-testid="_everyone_group_"
                            onClick={() => props.onShareToEveryoneChanged(!props.shareToEveryone)}
                        />
                        <ClickableChip
                            checked={props.onlyMyself}
                            label={t('post_dialog__select_recipients_only_myself')}
                            data-testid="_only_myself_group_"
                            onClick={() => props.onOnlyMyselfChanged(!props.onlyMyself)}
                        />
                    </SelectRecipientsUI>
                </Box>

                <Typography style={{ marginBottom: 10 }}>{t('post_dialog__more_options_title')}</Typography>
                <Box
                    style={{ marginBottom: 10 }}
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                    }}>
                    <ClickableChip
                        checked={props.imagePayload}
                        label={
                            <>
                                {t('post_dialog__image_payload')}
                                {Flags.image_payload_marked_as_beta && <sup className={classes.sup}>(Beta)</sup>}
                            </>
                        }
                        onClick={() => props.onImagePayloadSwitchChanged(!props.imagePayload)}
                        data-testid="image_chip"
                        disabled={props.imagePayloadUnchangeable}
                    />
                    {isDebug && <Chip label="Post metadata inspector" onClick={() => setShowPostMetadata((e) => !e)} />}
                    {showPostMetadata && (
                        <DebugMetadataInspector
                            onNewMetadata={(meta) => (globalTypedMessageMetadata.value = meta)}
                            onExit={() => setShowPostMetadata(false)}
                            meta={props.postContent.meta || new Map()}
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                {isTypedMessageText(props.postContent) && props.maxLength ? (
                    <CharLimitIndicator value={props.postContent.content.length} max={props.maxLength} />
                ) : null}
                {isMinds(activatedSocialNetworkUI) &&
                    currentImagePayloadStatus[activatedSocialNetworkUI.networkIdentifier].value === 'true' &&
                    !clipboardReadPermissionGranted && (
                        <Button variant="outlined" onClick={requestClipboardPermission} data-testid="auto_paste_prompt">
                            Enable auto paste
                        </Button>
                    )}
                <Button
                    className={classes.button}
                    variant="contained"
                    disabled={props.postBoxButtonDisabled}
                    onClick={props.onFinishButtonClicked}
                    data-testid="finish_button">
                    {t('post_dialog__button')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}

export interface PostDialogProps extends Omit<Partial<PostDialogUIProps>, 'open'> {
    open?: [boolean, (next: boolean) => void]
    reason?: 'timeline' | 'popup'
    identities?: Profile[]
    onRequestPost?: (target: Profile[], content: TypedMessage) => void
    onRequestReset?: () => void
    typedMessageMetadata?: ReadonlyMap<string, any>
}
export function PostDialog({ reason: props_reason = 'timeline', ...props }: PostDialogProps) {
    // network support
    const networkSupport = activatedSocialNetworkUI.injection.newPostComposition?.supportedOutputTypes
    const textOnly = networkSupport?.text === true && networkSupport.image === false
    const imageOnly = networkSupport?.image === true && networkSupport.text === false
    const imagePayloadButtonForzen = textOnly || imageOnly

    const { t, i18n } = useI18N()
    const [onlyMyselfLocal, setOnlyMyself] = useState(false)
    const onlyMyself = props.onlyMyself ?? onlyMyselfLocal
    const [shareToEveryoneLocal, setShareToEveryone] = useState(true)
    const shareToEveryone = props.shareToEveryone ?? shareToEveryoneLocal
    const typedMessageMetadata = or(props.typedMessageMetadata, useValueRef(globalTypedMessageMetadata))
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
    const availableShareTarget = props.availableShareTarget || people
    const currentIdentity = or(props.currentIdentity, useCurrentIdentity())
    const [currentShareTarget, setCurrentShareTarget] = useState<Profile[]>(() => [])
    //#endregion
    //#region Image Based Payload Switch
    const imagePayloadStatus = useValueRef(currentImagePayloadStatus[activatedSocialNetworkUI.networkIdentifier])
    const imagePayloadEnabled = imagePayloadStatus === 'true'
    const onImagePayloadSwitchChanged = or(
        props.onImagePayloadSwitchChanged,
        useCallback((checked) => {
            currentImagePayloadStatus[activatedSocialNetworkUI.networkIdentifier].value = String(checked)
        }, []),
    )
    //#endregion
    //#region callbacks
    const onRequestPost = or(
        props.onRequestPost,
        useCallback(
            async (target: Profile[], content: TypedMessage) => {
                const [encrypted, token] = await Services.Crypto.encryptTo(
                    content,
                    target.map((x) => x.identifier),
                    currentIdentity!.identifier,
                    !!shareToEveryone,
                )
                const activeUI = activatedSocialNetworkUI

                const redPacketPreText = isTwitter(activeUI)
                    ? t('additional_post_box__encrypted_post_pre_red_packet_twitter', { encrypted })
                    : t('additional_post_box__encrypted_post_pre_red_packet', { encrypted })

                // TODO: move into the plugin system
                const redPacketMetadata = RedPacketMetadataReader(typedMessageMetadata)
                if (imagePayloadEnabled || imageOnly) {
                    const isRedPacket = redPacketMetadata.ok
                    const isErc20 =
                        redPacketMetadata.ok &&
                        redPacketMetadata.val &&
                        redPacketMetadata.val.token &&
                        redPacketMetadata.val.token_type === EthereumTokenType.ERC20
                    const isDai = isErc20 && redPacketMetadata.ok && isDAI(redPacketMetadata.val.token?.address ?? '')
                    const isOkb = isErc20 && redPacketMetadata.ok && isOKB(redPacketMetadata.val.token?.address ?? '')

                    const relatedText = redPacketMetadata.ok
                        ? redPacketPreText.replace(encrypted, '')
                        : t('additional_post_box__steganography_post_pre', {
                              random: new Date().toLocaleString(),
                          })
                    activeUI.automation.nativeCompositionDialog?.appendText?.(relatedText, {
                        recover: false,
                    })
                    const img = await SteganographyTextPayload(
                        isRedPacket ? (isDai ? 'dai' : isOkb ? 'okb' : 'eth') : 'v2',
                        encrypted,
                    )
                    activeUI.automation.nativeCompositionDialog?.attachImage?.(img, {
                        recover: true,
                        relatedTextPayload: relatedText,
                    })
                } else {
                    const text = t('additional_post_box__encrypted_post_pre', { encrypted })

                    activeUI.automation.nativeCompositionDialog?.appendText?.(
                        redPacketMetadata.ok ? redPacketPreText : text,
                        {
                            recover: true,
                        },
                    )
                }
                // This step write data on gun.
                // there is nothing to write if it shared with public
                if (!shareToEveryone) Services.Crypto.publishPostAESKey(token)
            },
            [currentIdentity, shareToEveryone, typedMessageMetadata, imagePayloadEnabled, i18n.language],
        ),
    )
    const onRequestReset = or(
        props.onRequestReset,
        useCallback(() => {
            setOpen(false)
            setOnlyMyself(false)
            setShareToEveryone(true)
            setPostBoxContent(makeTypedMessageText(''))
            setCurrentShareTarget([])
            globalTypedMessageMetadata.value = new Map()
        }, [setOpen]),
    )
    const onFinishButtonClicked = useCallback(() => {
        onRequestPost(onlyMyself ? [currentIdentity!] : currentShareTarget, postBoxContent)
        onRequestReset()
    }, [currentIdentity, currentShareTarget, onRequestPost, onRequestReset, onlyMyself, postBoxContent])
    const onCloseButtonClicked = useCallback(() => {
        onRequestReset()
        setOpen(false)
    }, [setOpen, onRequestReset])
    //#endregion
    //#region My Identity
    const identities = useMyIdentities()
    useEffect(() => {
        return MaskMessage.events.compositionUpdated.on(({ reason, open, content, options }: CompositionEvent) => {
            if (reason !== props_reason || identities.length <= 0) return
            setOpen(open)
            if (content) setPostBoxContent(content)
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
            shareToEveryone={shareToEveryoneLocal}
            onlyMyself={onlyMyself}
            availableShareTarget={availableShareTarget}
            imagePayload={!textOnly && (imageOnly || imagePayloadEnabled)}
            imagePayloadUnchangeable={imagePayloadButtonForzen}
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
        />
    )
}
export function CharLimitIndicator({ value, max, ...props }: CircularProgressProps & { value: number; max: number }) {
    const displayLabel = max - value < 40
    const normalized = Math.min((value / max) * 100, 100)
    const style = { transitionProperty: 'transform,width,height,color' } as React.CSSProperties
    return (
        <Box
            sx={{
                position: 'relative',
                display: 'inline-flex',
                marginLeft: 1,
                marginRight: 1,
            }}>
            <CircularProgress
                variant="determinate"
                value={normalized}
                color={displayLabel ? 'secondary' : 'primary'}
                size={displayLabel ? void 0 : 16}
                {...props}
                style={value >= max ? { color: 'red', ...style, ...props.style } : { ...style, ...props.style }}
            />
            {displayLabel ? (
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <Typography variant="caption" component="div" color="textSecondary">
                        {max - value}
                    </Typography>
                </Box>
            ) : null}
        </Box>
    )
}

function PluginRenderer() {
    const pluginField = usePluginI18NField()
    const operatingSupportedChainMapping = useActivatedPluginSNSAdaptorWithOperatingChainSupportedMet()
    const result = useActivatedPluginsSNSAdaptor()
        .sort((pluginA, pluginB) => {
            if (pluginA.ID === redpacketBase.ID && pluginB.ID === ITOBase.ID) return -1
            if (pluginB.ID === redpacketBase.ID && pluginA.ID === ITOBase.ID) return 1
            if ([redpacketBase.ID, ITOBase.ID].includes(pluginA.ID)) return -1
            if ([redpacketBase.ID, ITOBase.ID].includes(pluginB.ID)) return 1
            return 0
        })
        .map((plugin) =>
            Result.wrap(() => {
                const entry = plugin.CompositionDialogEntry
                const unstable = plugin.enableRequirement.target !== 'stable'
                if (!entry || !operatingSupportedChainMapping[plugin.ID]) return null
                return (
                    <ErrorBoundary subject={`Plugin "${pluginField(plugin.ID, plugin.name)}"`} key={plugin.ID}>
                        {'onClick' in entry ? (
                            <PluginKindCustom {...entry} unstable={unstable} id={plugin.ID} />
                        ) : (
                            <PluginKindDialog {...entry} unstable={unstable} id={plugin.ID} />
                        )}
                    </ErrorBoundary>
                )
            }).unwrapOr(null),
        )
    return <>{result}</>
}
function BadgeRenderer({ meta }: { meta: TypedMessage['meta'] }) {
    const plugins = useActivatedPluginsSNSAdaptor()
    const i18n = usePluginI18NField()
    if (!meta) return null
    const metadata = [...meta.entries()]
    return (
        <>
            {metadata.flatMap(([key, value]) => {
                return plugins.map((plugin) => {
                    const render = plugin.CompositionDialogMetadataBadgeRender
                    if (!render) return null

                    if (typeof render === 'function') {
                        if (process.env.NODE_ENV === 'development') {
                            // crash early in dev
                            return normalizeBadgeDescriptor(key, plugin, render(key, value), i18n)
                        }
                        try {
                            return normalizeBadgeDescriptor(key, plugin, render(key, value), i18n)
                        } catch (error) {
                            console.error(error)
                            return null
                        }
                    } else {
                        const f = render.get(key)
                        if (!f) return null
                        if (process.env.NODE_ENV === 'development') {
                            // crash early in dev
                            return normalizeBadgeDescriptor(key, plugin, f(value), i18n)
                        }
                        try {
                            return normalizeBadgeDescriptor(key, plugin, f(value), i18n)
                        } catch (error) {
                            console.error(error)
                            return null
                        }
                    }
                })
            })}
        </>
    )
}
function normalizeBadgeDescriptor(
    meta: string,
    plugin: Plugin.SNSAdaptor.Definition,
    desc: Plugin.SNSAdaptor.BadgeDescriptor | string | null,
    i18n: (id: string, field: I18NStringField) => string,
) {
    if (!desc) return null
    if (typeof desc === 'string') desc = { text: desc, tooltip: `Provided by plugin "${i18n(plugin.ID, plugin.name)}"` }
    return (
        <MetaBadge key={meta + ';' + plugin.ID} title={desc.tooltip || ''} meta={meta}>
            {desc.text}
        </MetaBadge>
    )
}
function MetaBadge({ title, children, meta: key }: React.PropsWithChildren<{ title: React.ReactChild; meta: string }>) {
    return (
        <Box sx={{ marginRight: 1, marginTop: 1, display: 'inline-block' }}>
            <Tooltip title={title}>
                <span>
                    <Chip onDelete={() => editActivatedPostMetadata((meta) => meta.delete(key))} label={children} />
                </span>
            </Tooltip>
        </Box>
    )
}

type ExtraPluginProps = { unstable: boolean; id: string }
function PluginKindCustom(props: Plugin.SNSAdaptor.CompositionDialogEntryCustom & ExtraPluginProps) {
    const { classes } = useStyles()
    const { id, label, onClick, unstable } = props
    useActivatePluginCompositionEntryEvent(id, onClick)
    return (
        <ClickableChip
            label={
                <>
                    <PluginI18NFieldRender field={label} pluginID={id} />
                    {unstable && <sup className={classes.sup}>(Beta)</sup>}
                </>
            }
            onClick={onClick}
        />
    )
}

function PluginKindDialog(props: Plugin.SNSAdaptor.CompositionDialogEntryDialog & ExtraPluginProps) {
    const { classes } = useStyles()
    const { dialog: Dialog, id, label, unstable, keepMounted } = props
    const [open, setOpen] = useState(false)
    const opener = useCallback(() => setOpen(true), [])
    const close = useCallback(() => setOpen(false), [])
    useActivatePluginCompositionEntryEvent(id, opener)
    const chip = (
        <ClickableChip
            label={
                <>
                    <PluginI18NFieldRender field={label} pluginID={id} />
                    {unstable && <sup className={classes.sup}>(Beta)</sup>}
                </>
            }
            onClick={opener}
        />
    )
    if (keepMounted || open)
        return (
            <>
                {chip}
                <span style={{ display: 'none' }}>
                    {/* Dialog should use portals to render. */}
                    <Dialog open={open} onClose={close} />
                </span>
            </>
        )
    return chip
}
function useActivatePluginCompositionEntryEvent(id: string, onActivate: () => void) {
    useEffect(
        () =>
            MaskMessage.events.activatePluginCompositionEntry.on((request) => {
                if (request === id) onActivate()
            }),
        [onActivate, id],
    )
}
