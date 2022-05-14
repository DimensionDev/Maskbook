import {
    forwardRef,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
    startTransition,
    useCallback,
    SetStateAction,
} from 'react'
import { Typography, Chip, Button } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import type { SerializableTypedMessages, TypedMessage } from '@masknet/typed-message'
import { makeStyles } from '@masknet/theme'
import { SendIcon } from '@masknet/icons'
import { PluginEntryRender, PluginEntryRenderRef } from './PluginEntryRender'
import { TypedMessageEditor, TypedMessageEditorRef } from './TypedMessageEditor'
import { CharLimitIndicator } from './CharLimitIndicator'
import { useI18N } from '../../utils'
import { PersistentStorages } from '../../../shared'
import type { ProfileInformation } from '@masknet/shared-base'
import { CompositionContext } from '@masknet/plugin-infra/content-script'
import { DebugMetadataInspector } from '../shared/DebugMetadataInspector'
import type { EncryptTargetE2E, EncryptTargetPublic } from '@masknet/encryption'
import { useSubscription } from 'use-subscription'
import { SelectRecipientsUI } from '../shared/SelectRecipients/SelectRecipients'
import { VisibleToRow } from './VisibleToRow'
import { EncryptionMethodRow } from './EncryptionMethodRow'

const useStyles = makeStyles()((theme) => ({
    root: {
        '& > *': {
            marginBottom: '18px !important',
        },
        minHeight: 450,
        overflowY: 'auto',
    },
    flex: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    sup: {
        paddingLeft: 2,
    },
    actions: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        display: 'flex',
        padding: '14px 16px',
        boxSizing: 'border-box',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        background: theme.palette.background.paper,
        boxShadow: `0px 0px 20px 0px ${theme.palette.background.messageShadow}`,
        transform: 'translateX(-16px)',
    },

    between: {
        justifyContent: 'space-between',
    },
    popper: {
        overflow: 'visible',
        padding: 6,
    },
    popperText: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
    },
    optionTitle: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.text.secondary,
        marginRight: 12,
    },
}))

export interface LazyRecipients {
    request(): void
    recipients?: ProfileInformation[]
    hasRecipients: boolean
}
export interface CompositionProps {
    maxLength?: number
    onSubmit(data: SubmitComposition): Promise<void>
    onChange?(message: TypedMessage): void
    onConnect?(): any
    onCreate?(): any
    e2eEncryptionDisabled?: DisabledReason
    recipients: LazyRecipients
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
    const { classes, cx } = useStyles()
    const { t } = useI18N()

    const [currentPostSize, __updatePostSize] = useState(0)
    const [shareWithOpen, setShareWithOpen] = useState(false)
    const Editor = useRef<TypedMessageEditorRef | null>(null)
    const PluginEntry = useRef<PluginEntryRenderRef>(null)
    const [sending, setSending] = useState(false)

    const updatePostSize = useCallback((size: number) => {
        startTransition(() => __updatePostSize(size))
    }, [])
    const { setEncryptionKind, encryptionKind, recipientSelectorAvailable, recipients, setRecipients } =
        useSetEncryptionKind(props)
    const { encodingKind, setEncoding } = useEncryptionEncode(props)

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

                <div className={classes.flex}>
                    <Typography className={classes.optionTitle}>{t('plugins')}</Typography>
                    <PluginEntryRender readonly={sending} ref={PluginEntry} />
                </div>
                <div className={cx(classes.flex, classes.between)}>
                    <VisibleToRow
                        selected={encryptionKind === 'Everyone' ? 'all' : recipients.length ? 'share' : 'private'}
                        onConnect={props.onConnect}
                        onCreate={props.onCreate}
                        e2eDisabled={props.e2eEncryptionDisabled}
                        shareWithNum={recipients.length}
                        onChange={(event) => {
                            if (event === 'all') {
                                setEncryptionKind('Everyone')
                            } else {
                                if (event === 'share') {
                                    setShareWithOpen(true)
                                }
                                if (event === 'private') {
                                    setRecipients([])
                                }
                                setEncryptionKind('E2E')
                            }
                        }}
                        toShare={() => {
                            setEncryptionKind('E2E')
                            setShareWithOpen(true)
                        }}
                    />

                    <SelectRecipientsUI
                        open={shareWithOpen}
                        onClose={() => setShareWithOpen(false)}
                        disabled={sending}
                        items={props.recipients}
                        selected={recipients}
                        onSetSelected={setRecipients}
                    />
                </div>
                <div className={cx(classes.flex, classes.between)}>
                    <EncryptionMethodRow
                        selected={encodingKind}
                        onChange={(event) => setEncoding(event as SetStateAction<'text' | 'image'>)}
                    />
                </div>
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
                    variant="roundedContained"
                    onClick={onSubmit}
                    startIcon={<SendIcon style={{ width: 18, height: 18 }} />}>
                    {t('post_dialog__button')}
                </LoadingButton>
            </div>
        </CompositionContext.Provider>
    )
})

export enum DisabledReason {
    // These reasons only applies to E2E encryption.
    NoPersona = 1,
    NoLocalKey = 2,
    NoConnect = 3,
}
function useSetEncryptionKind(props: Pick<CompositionProps, 'e2eEncryptionDisabled' | 'recipients'>) {
    const [internal_encryptionKind, setEncryptionKind] = useState<'Everyone' | 'E2E'>('Everyone')
    // TODO: Change to ProfileIdentifier
    const [recipients, setRecipients] = useState<ProfileInformation[]>([])

    const everyoneSelected = props.e2eEncryptionDisabled ? true : internal_encryptionKind === 'Everyone'
    const recipientSelectorAvailable = props.recipients.hasRecipients && !everyoneSelected

    return {
        recipients,
        setRecipients,
        recipientSelectorAvailable,
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
