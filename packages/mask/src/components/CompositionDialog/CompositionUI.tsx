import { forwardRef, useImperativeHandle, useMemo, useRef, useState, startTransition, useCallback } from 'react'
import { Typography, Chip, Button } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import type { SerializableTypedMessages, TypedMessage } from '@masknet/typed-message'
import { makeStyles } from '@masknet/theme'
import { ImagePayloadIcon } from '@masknet/icons'
import { Send } from '@mui/icons-material'
import { PluginEntryRender, PluginEntryRenderRef } from './PluginEntryRender'
import { TypedMessageEditor, TypedMessageEditorRef } from './TypedMessageEditor'
import { CharLimitIndicator } from './CharLimitIndicator'
import { useI18N } from '../../utils'
import { Flags, PersistentStorages } from '../../../shared'
import { ClickableChip } from '../shared/SelectRecipients/ClickableChip'
import { SelectRecipientsUI } from '../shared/SelectRecipients/SelectRecipients'
import type { Profile } from '../../database'
import { CompositionContext } from '@masknet/plugin-infra/content-script'
import { DebugMetadataInspector } from '../shared/DebugMetadataInspector'
import { Trans } from 'react-i18next'
import type { EncryptTargetE2E, EncryptTargetPublic } from '@masknet/encryption'
import { useSubscription } from 'use-subscription'

const useStyles = makeStyles()({
    root: {
        '& > *': {
            marginBottom: '10px !important',
        },
    },
    flex: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    sup: {
        paddingLeft: 2,
    },
    actions: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        '& > *': { marginLeft: '12px !important' },
    },
})

export interface CompositionProps {
    maxLength?: number
    onSubmit(data: SubmitComposition): Promise<void>
    onChange?(message: TypedMessage): void
    disabledRecipients?: undefined | 'E2E' | 'Everyone'
    recipients: Profile[]
    // Enabled features
    supportTextEncoding: boolean
    supportImageEncoding: boolean
    // Requirements
    requireClipboardPermission?: boolean
    hasClipboardPermission?: boolean
    onRequestClipboardPermission?(): void
    onQueryClipboardPermission?(): void
}
export interface SubmitComposition {
    target: EncryptTargetPublic | EncryptTargetE2E
    content: SerializableTypedMessages
    encode: 'text' | 'image'
}
export interface CompositionRef {
    setMessage(message: SerializableTypedMessages): void
    setEncryptionKind(kind: 'E2E' | 'Everyone'): void
    startPlugin(id: string): void
    reset(): void
}
export const CompositionDialogUI = forwardRef<CompositionRef, CompositionProps>((props, ref) => {
    const { classes } = useStyles()
    const { t } = useI18N()

    const [currentPostSize, __updatePostSize] = useState(0)

    const Editor = useRef<TypedMessageEditorRef | null>(null)
    const PluginEntry = useRef<PluginEntryRenderRef>(null)

    const [sending, setSending] = useState(false)

    const updatePostSize = useCallback((size: number) => {
        startTransition(() => __updatePostSize(size))
    }, [])

    const {
        E2EDisabled,
        setEncryptionKind,
        encryptionKind,
        everyoneDisabled,
        recipientSelectorAvailable,
        recipients,
        setRecipients,
    } = useSetEncryptionKind(props)
    const { encodingKind, imagePayloadReadonly, imagePayloadSelected, imagePayloadVisible, setEncoding } =
        useEncryptionEncode(props)

    const reset = useCallback(() => {
        startTransition(() => {
            Editor.current?.reset()
            setEncryptionKind('Everyone')
            setRecipients([])
            // Don't clean up the image/text selection across different encryption.
            // setEncoding('text')
            setSending(false)
        })
    }, [])

    const refItem = useMemo(
        (): CompositionRef => ({
            setMessage: (msg) => {
                if (Editor.current) Editor.current.value = msg
            },
            setEncryptionKind,
            startPlugin: (id) => PluginEntry.current?.openPlugin(id),
            reset,
        }),
        [reset],
    )

    useImperativeHandle(ref, () => refItem, [refItem])

    const context = useMemo(
        (): CompositionContext => ({
            attachMetadata: (meta, data) => Editor.current?.attachMetadata(meta, data),
            dropMetadata: (meta) => Editor.current?.dropMetadata(meta),
        }),
        [],
    )
    const MoreOptions = [
        imagePayloadVisible && (
            <ClickableChip
                key="image"
                checked={imagePayloadSelected}
                label={
                    <>
                        <ImagePayloadIcon style={{ width: 16, height: 16 }} />
                        {t('post_dialog__image_payload')}
                        {Flags.image_payload_marked_as_beta && (
                            <Trans i18nKey="beta_sup" components={{ sup: <sup className={classes.sup} /> }} />
                        )}
                    </>
                }
                onClick={() => setEncoding(encodingKind === 'image' ? 'text' : 'image')}
                disabled={imagePayloadReadonly || sending}
            />
        ),
        ...useMetadataDebugger(context, Editor.current),
    ].filter(Boolean)

    const submitAvailable = currentPostSize > 0 && currentPostSize < (props.maxLength ?? Number.POSITIVE_INFINITY)
    const onSubmit = useCallback(() => {
        if (!Editor.current) return
        setSending(true)
        props
            .onSubmit({
                content: Editor.current.value,
                encode: encodingKind,
                target:
                    encryptionKind === 'E2E'
                        ? { type: 'E2E', target: recipients.map((x) => x.identifier) }
                        : { type: 'public' },
            })
            .finally(reset)
    }, [encodingKind, encryptionKind, recipients, props.onSubmit])
    return (
        <CompositionContext.Provider value={context}>
            <div className={classes.root}>
                <TypedMessageEditor
                    autoFocus
                    readonly={sending}
                    ref={(e) => {
                        Editor.current = e
                        if (e) updatePostSize(e.estimatedLength)
                    }}
                    onChange={(message) => {
                        startTransition(() => props.onChange?.(message))
                        updatePostSize(Editor.current?.estimatedLength || 0)
                    }}
                />
                <Typography>
                    <Trans
                        i18nKey="post_dialog_plugins_experimental"
                        components={{
                            sup: <sup />,
                        }}
                    />
                </Typography>
                <div className={classes.flex}>
                    <PluginEntryRender readonly={sending} ref={PluginEntry} />
                </div>
                <Typography>{t('post_dialog__select_recipients_title')}</Typography>
                <div className={classes.flex}>
                    <ClickableChip
                        checked={encryptionKind === 'Everyone'}
                        disabled={everyoneDisabled || sending}
                        label={t('post_dialog__select_recipients_share_to_everyone')}
                        onClick={() => setEncryptionKind('Everyone')}
                    />
                    <ClickableChip
                        checked={encryptionKind === 'E2E'}
                        disabled={E2EDisabled || sending}
                        label={t('post_dialog__select_recipients_end_to_end')}
                        onClick={() => setEncryptionKind('E2E')}
                    />
                    {recipientSelectorAvailable && (
                        <SelectRecipientsUI
                            disabled={sending}
                            items={props.recipients}
                            selected={recipients}
                            onSetSelected={setRecipients}
                        />
                    )}
                </div>
                {MoreOptions.length ? (
                    <>
                        <Typography>{t('post_dialog__more_options_title')}</Typography>
                        <div className={classes.flex}>{MoreOptions}</div>
                    </>
                ) : null}
            </div>
            <div className={classes.actions}>
                {props.maxLength ? <CharLimitIndicator value={currentPostSize} max={props.maxLength} /> : null}
                {props.requireClipboardPermission && !props.hasClipboardPermission && (
                    <Button variant="outlined" onClick={props.onRequestClipboardPermission}>
                        {t('post_dialog_enable_paste_auto')}
                    </Button>
                )}
                <LoadingButton
                    disabled={!submitAvailable}
                    loading={sending}
                    loadingPosition="start"
                    variant="contained"
                    onClick={onSubmit}
                    startIcon={<Send />}>
                    {t('post_dialog__button')}
                </LoadingButton>
            </div>
        </CompositionContext.Provider>
    )
})

function useSetEncryptionKind(props: Pick<CompositionProps, 'disabledRecipients' | 'recipients'>) {
    const [encryptionKind, setEncryptionKind] = useState<'Everyone' | 'E2E'>(
        props.disabledRecipients === 'Everyone' ? 'E2E' : 'Everyone',
    )
    // TODO: Change to ProfileIdentifier
    const [recipients, setRecipients] = useState<Profile[]>([])

    const everyoneDisabled = props.disabledRecipients === 'Everyone'
    const E2EDisabled = props.disabledRecipients === 'E2E'

    const everyoneSelected = props.disabledRecipients !== 'Everyone' && (E2EDisabled || encryptionKind === 'Everyone')
    const _E2ESelected =
        props.disabledRecipients !== 'E2E' && (props.disabledRecipients === 'Everyone' || encryptionKind === 'E2E')
    const recipientSelectorAvailable = Boolean(props.recipients.length && !everyoneSelected)

    return {
        recipients,
        setRecipients,
        recipientSelectorAvailable,

        everyoneDisabled,
        E2EDisabled,

        encryptionKind: everyoneSelected ? ('Everyone' as const) : ('E2E' as const),
        setEncryptionKind,
    }
}

function useEncryptionEncode(props: Pick<CompositionProps, 'supportImageEncoding' | 'supportTextEncoding'>) {
    const [encoding, setEncoding] = useState<'text' | 'image'>(props.supportTextEncoding ? 'text' : 'image')

    const imagePayloadSelected = props.supportImageEncoding && (encoding === 'image' || !props.supportTextEncoding)
    // XOR
    const imagePayloadReadonly =
        (props.supportImageEncoding && !props.supportTextEncoding) ||
        (!props.supportImageEncoding && props.supportTextEncoding)
    const imagePayloadVisible = props.supportImageEncoding
    const encodingKind: typeof encoding = imagePayloadSelected ? 'image' : 'text'

    return {
        encodingKind,
        imagePayloadSelected,
        imagePayloadReadonly,
        imagePayloadVisible,
        setEncoding,
    }
}

function useMetadataDebugger(context: CompositionContext, Editor: TypedMessageEditorRef | null) {
    const isDebug = useSubscription(PersistentStorages.Settings.storage.debugging.subscription)
    const [__MetadataDebuggerMeta, __configureMetadataDebugger] = useState<TypedMessage['meta'] | null>(null)

    const __syncMetadataDebugger = () => {
        const meta = Editor?.value.meta ?? new Map()
        setTimeout(() => __configureMetadataDebugger(meta))
    }
    const UI = [
        isDebug && <Chip key="debug" label="Post metadata inspector" onClick={__syncMetadataDebugger} />,
        isDebug && __MetadataDebuggerMeta && (
            <DebugMetadataInspector
                key="debug-dialog"
                meta={__MetadataDebuggerMeta}
                onNewMeta={(meta, data) => {
                    context.attachMetadata(meta, data)
                    __syncMetadataDebugger()
                }}
                onDeleteMeta={(meta) => {
                    context.dropMetadata(meta)
                    __syncMetadataDebugger()
                }}
                onExit={() => __configureMetadataDebugger(null)}
            />
        ),
    ]
    return UI
}
