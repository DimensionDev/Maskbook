import { useState, useCallback, useEffect } from 'react'
import {
    makeStyles,
    InputBase,
    Button,
    Typography,
    Box,
    Chip,
    ThemeProvider,
    Theme,
    DialogProps,
    Tooltip,
    CircularProgressProps,
    CircularProgress,
    DialogContent,
    DialogActions,
} from '@material-ui/core'
import { Plugin, useActivatedPluginsSNSAdaptor } from '@dimensiondev/mask-plugin-infra'
import { CompositionEvent, MaskMessage, useValueRef, useI18N, Flags } from '../../utils'
import { useStylesExtends, or } from '../custom-ui-helper'
import type { Profile, Group } from '../../database'
import { useFriendsList, useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { currentImagePayloadStatus, debugModeSetting } from '../../settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import Services from '../../extension/service'
import { SelectRecipientsUI, SelectRecipientsUIProps } from '../shared/SelectRecipients/SelectRecipients'
import { ClickableChip } from '../shared/SelectRecipients/ClickableChip'
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
import { RedPacketMetadataReader } from '../../plugins/RedPacket/helpers'
import { PluginUI } from '../../plugins/PluginUI'
import { Result } from 'ts-results'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { InjectedDialog } from '../shared/InjectedDialog'
import { DebugMetadataInspector } from '../shared/DebugMetadataInspector'
import { PluginStage } from '../../plugins/types'
import { editActivatedPostMetadata, globalTypedMessageMetadata } from '../../protocols/typed-message/global-state'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { SteganographyTextPayload } from './SteganographyTextPayload'

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
    sup: {
        paddingLeft: 2,
    },
})

export interface PostDialogUIProps extends withClasses<never> {
    theme?: Theme
    open: boolean
    onlyMyself: boolean
    shareToEveryone: boolean
    imagePayload: boolean
    imagePayloadUnchangeable: boolean
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
    const isDebug = useValueRef(debugModeSetting)
    const [showPostMetadata, setShowPostMetadata] = useState(false)
    const onPostContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const newText = e.target.value
        const msg = props.postContent
        if (isTypedMessageText(msg)) props.onPostContentChanged(makeTypedMessageText(newText, msg.meta))
        else throw new Error('Not impled yet')
    }

    if (!isTypedMessageText(props.postContent)) return <>Unsupported type to edit</>
    const metadataBadge = [...PluginUI].flatMap((plugin) =>
        Result.wrap(() => {
            const knownMeta = plugin.postDialogMetadataBadge
            if (!knownMeta) return undefined
            return [...knownMeta.entries()].map(([metadataKey, tag]) => {
                return renderWithMetadataUntyped(props.postContent.meta, metadataKey, (r) => (
                    <Box
                        key={metadataKey}
                        sx={{
                            marginRight: 1,
                            marginTop: 1,
                            display: 'inline-block',
                        }}>
                        <Tooltip title={`Provided by plugin "${plugin.pluginName}"`}>
                            <Chip
                                onDelete={() => editActivatedPostMetadata((meta) => meta.delete(metadataKey))}
                                label={tag(r)}
                            />
                        </Tooltip>
                    </Box>
                ))
            })
        }).unwrapOr(null),
    )
    const oldPluginEntries = [...PluginUI].flatMap((plugin) =>
        Result.wrap(() => {
            const entries = plugin.postDialogEntries
            if (!entries) return null
            return entries.map((opt, index) => {
                return (
                    <ErrorBoundary subject={`Plugin "${plugin.pluginName}"`} key={plugin.identifier + ' ' + index}>
                        <ClickableChip
                            label={
                                <>
                                    {opt.label}
                                    {plugin.stage === PluginStage.Beta && <sup className={classes.sup}>(Beta)</sup>}
                                </>
                            }
                            onClick={opt.onClick}
                        />
                    </ErrorBoundary>
                )
            })
        }).unwrapOr(null),
    )
    return (
        <>
            <ThemeProvider theme={props.theme ?? defaultTheme}>
                <InjectedDialog open={props.open} onClose={props.onCloseButtonClicked} title={t('post_dialog__title')}>
                    <DialogContent>
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
                            {oldPluginEntries}
                        </Box>
                        <Typography style={{ marginBottom: 10 }}>
                            {t('post_dialog__select_recipients_title')}
                        </Typography>
                        <Box
                            style={{ marginBottom: 10 }}
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                            }}>
                            <SelectRecipientsUI
                                items={props.availableShareTarget}
                                selected={props.currentShareTarget}
                                onSetSelected={props.onSetSelected}
                                {...props.SelectRecipientsUIProps}>
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
                                        {Flags.image_payload_marked_as_beta && (
                                            <sup className={classes.sup}>(Beta)</sup>
                                        )}
                                    </>
                                }
                                onClick={() => props.onImagePayloadSwitchChanged(!props.imagePayload)}
                                data-testid="image_chip"
                                disabled={props.imagePayloadUnchangeable}
                            />
                            {isDebug && (
                                <Chip label="Post metadata inspector" onClick={() => setShowPostMetadata((e) => !e)} />
                            )}
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
                        <Button
                            variant="contained"
                            disabled={props.postBoxButtonDisabled}
                            onClick={props.onFinishButtonClicked}
                            data-testid="finish_button">
                            {t('post_dialog__button')}
                        </Button>
                    </DialogActions>
                </InjectedDialog>
            </ThemeProvider>
        </>
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
    const [currentShareTarget, setCurrentShareTarget] = useState<(Profile | Group)[]>(() => [])
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
            async (target: (Profile | Group)[], content: TypedMessage) => {
                const [encrypted, token] = await Services.Crypto.encryptTo(
                    content,
                    target.map((x) => x.identifier),
                    currentIdentity!.identifier,
                    !!shareToEveryone,
                )
                const activeUI = activatedSocialNetworkUI
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

                    const relatedText = t('additional_post_box__steganography_post_pre', {
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
                    let text = t('additional_post_box__encrypted_post_pre', { encrypted })
                    if (redPacketMetadata.ok) {
                        if (i18n.language?.includes('zh')) {
                            text = isTwitter(activeUI)
                                ? `用 #mask_io @realMaskbook 開啟紅包 ${encrypted}`
                                : `用 #mask_io 開啟紅包 ${encrypted}`
                        } else {
                            text = isTwitter(activeUI)
                                ? `Claim this Red Packet with #mask_io @realMaskbook ${encrypted}`
                                : `Claim this Red Packet with #mask_io ${encrypted}`
                        }
                    }
                    activeUI.automation.nativeCompositionDialog?.appendText?.(text, {
                        recover: true,
                    })
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
        setOpen(false)
    }, [setOpen])
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
    const result = useActivatedPluginsSNSAdaptor().map((plugin) =>
        Result.wrap(() => {
            const entry = plugin.CompositionDialogEntry
            if (!entry) return null
            const unstable = plugin.enableRequirement.target !== 'stable'
            return (
                <ErrorBoundary subject={`Plugin "${plugin.name.fallback}"`} key={plugin.ID}>
                    {'onClick' in entry ? (
                        <PluginKindCustom {...entry} unstable={unstable} />
                    ) : (
                        <PluginKindDialog {...entry} unstable={unstable} />
                    )}
                </ErrorBoundary>
            )
        }).unwrapOr(null),
    )
    return <>{result}</>
}
function renderLabel(label: Plugin.SNSAdaptor.CompositionDialogEntry['label']): React.ReactNode {
    if (!label) return null
    if (typeof label === 'object' && 'fallback' in label) return label.fallback
    return label
}
function PluginKindCustom(props: Plugin.SNSAdaptor.CompositionDialogEntryCustom & { unstable: boolean }) {
    const classes = useStyles()
    return (
        <ClickableChip
            label={
                <>
                    {renderLabel(props.label)}
                    {props.unstable && <sup className={classes.sup}>(Beta)</sup>}
                </>
            }
            onClick={props.onClick}
        />
    )
}

function PluginKindDialog(props: Plugin.SNSAdaptor.CompositionDialogEntryDialog & { unstable: boolean }) {
    const classes = useStyles()
    const { dialog: Dialog } = props
    const [open, setOpen] = useState(false)
    const opener = useCallback(() => setOpen(true), [])
    const close = useCallback(() => setOpen(false), [])
    const chip = (
        <ClickableChip
            label={
                <>
                    {renderLabel(props.label)}
                    {props.unstable && <sup className={classes.sup}>(Beta)</sup>}
                </>
            }
            onClick={opener}
        />
    )
    if (props.keepMounted || open)
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
