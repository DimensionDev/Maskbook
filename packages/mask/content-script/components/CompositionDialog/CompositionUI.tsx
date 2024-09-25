import {
    type RefAttributes,
    startTransition,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'
import { LoadingButton } from '@mui/lab'
import { Button, DialogActions, Typography, alpha } from '@mui/material'
import type { EncryptTargetPublic } from '@masknet/encryption'
import { Icons } from '@masknet/icons'
import {
    TypedMessageEditor,
    type TypedMessageEditorRef,
    CharLimitIndicator,
    PluginEntryRender,
    type PluginEntryRenderRef,
} from '@masknet/shared'
import { CompositionContext, type CompositionType } from '@masknet/plugin-infra/content-script'
import { EncryptionTargetType, type ProfileInformation } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { SerializableTypedMessages, TypedMessage } from '@masknet/typed-message'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { SelectRecipientsUI } from '../shared/SelectRecipients/SelectRecipients.js'
import { EncryptionMethodSelector, EncryptionMethodType } from './EncryptionMethodSelector.js'
import { EncryptionTargetSelector } from './EncryptionTargetSelector.js'
import type { EncryptTargetE2EFromProfileIdentifier } from '../../../background/services/crypto/encryption.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        '& > *': {
            height: '36px !important',
        },
        minHeight: 450,
        maxHeight: 464,
        height: 464,
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(2),
    },
    flex: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    between: {
        justifyContent: 'space-between',
    },
    optionTitle: {
        lineHeight: '18px',
        fontSize: 14,
        color: theme.palette.text.secondary,
        marginRight: 12,
    },
    editorWrapper: {
        flex: 1,
        width: 568,
        background: theme.palette.maskColor.bottom,
        padding: 0,
        boxSizing: 'border-box',
        borderRadius: 8,
        marginBottom: 16,
    },
    icon: {
        width: 18,
        height: 18,
        fill: theme.palette.text.buttonText,
    },
    action: {
        height: 68,
        padding: '0 16px',
        boxShadow:
            theme.palette.mode === 'light' ?
                ' 0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12);',
        background: alpha(theme.palette.maskColor.bottom, 0.8),
        justifyContent: 'space-between',
        display: 'flex',
    },
    personaAction: {
        flex: 1,
    },
}))

export interface LazyRecipients {
    request(): void
    recipients?: ProfileInformation[]
}
export interface CompositionProps extends RefAttributes<CompositionRef> {
    type: CompositionType
    maxLength?: number
    onSubmit(data: SubmitComposition): Promise<void>
    onChange?(message: TypedMessage): void
    isOpenFromApplicationBoard: boolean
    e2eEncryptionDisabled(encode: EncryptionMethodType): E2EUnavailableReason | undefined
    recipients: LazyRecipients
    // Enabled features
    supportTextEncoding: boolean
    supportImageEncoding: boolean
    // Requirements
    requireClipboardPermission?: boolean
    hasClipboardPermission?: boolean
    onRequestClipboardPermission?(): void
    onQueryClipboardPermission?(): void
    initialMeta?: Record<string, unknown>
    personaAction?: React.ReactNode
}
export interface SubmitComposition {
    target: EncryptTargetPublic | EncryptTargetE2EFromProfileIdentifier
    content: SerializableTypedMessages
    encode: 'text' | 'image'
    version: -37 | -38
}
export interface CompositionRef {
    setMessage(message: SerializableTypedMessages): void
    setEncryptionKind(kind: EncryptionTargetType): void
    startPlugin(id: string, props?: any): void
    reset(): void
}
export function CompositionDialogUI({ ref, ...props }: CompositionProps) {
    const { classes, cx } = useStyles()

    const [currentPostSize, __updatePostSize] = useState(0)

    const [isSelectRecipientOpen, setSelectRecipientOpen] = useState(false)
    const Editor = useRef<TypedMessageEditorRef | null>(null)
    const PluginEntry = useRef<PluginEntryRenderRef>(null)

    const [sending, setSending] = useState(false)

    const updatePostSize = useCallback((size: number) => {
        startTransition(() => __updatePostSize(size))
    }, [])

    const { encodingKind, setEncoding } = useEncryptionEncode(props)
    const { setEncryptionKind, encryptionKind, recipients, setRecipients } = useSetEncryptionKind(props, encodingKind)
    const reset = useCallback(() => {
        startTransition(() => {
            Editor.current?.reset()
            setEncryptionKind(EncryptionTargetType.Public)
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
            startPlugin: (id, props) => {
                PluginEntry.current?.openPlugin(id, props)
            },
            reset,
        }),
        [reset],
    )

    useImperativeHandle(ref, () => refItem, [refItem])

    useEffect(() => {
        if (!props.initialMeta || !Editor.current) return
        for (const [meta, data] of Object.entries(props.initialMeta)) {
            Editor.current.attachMetadata(meta, data)
        }
    }, [props.initialMeta, Editor.current])

    const context = useMemo(
        (): CompositionContext => ({
            type: props.type,
            getMetadata: () => Editor.current?.value.meta,
            attachMetadata: (meta, data) => Editor.current?.attachMetadata(meta, data),
            dropMetadata: (meta) => Editor.current?.dropMetadata(meta),
        }),
        [props.type, Editor.current],
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
                    encryptionKind === EncryptionTargetType.Public ?
                        { type: 'public' }
                    :   {
                            type: 'E2E',
                            target: recipients.map((x) => ({
                                profile: x.identifier,
                                persona: x.linkedPersona,
                            })),
                        },
                version: encodingKind === EncryptionMethodType.Text ? -37 : -38,
            })
            .finally(reset)
    }, [encodingKind, encryptionKind, recipients, props.onSubmit])
    return (
        <CompositionContext value={context}>
            <div className={classes.root}>
                <div className={classes.editorWrapper}>
                    <TypedMessageEditor
                        autoFocus
                        readonly={sending}
                        ref={(element) => {
                            Editor.current = element
                            if (element) updatePostSize(element.estimatedLength)
                        }}
                        onChange={(message) => {
                            startTransition(() => props.onChange?.(message))
                            updatePostSize(Editor.current?.estimatedLength || 0)
                        }}
                    />
                </div>

                <div className={classes.flex}>
                    <Typography className={classes.optionTitle}>
                        <Trans>Plugins</Trans>
                    </Typography>
                    <PluginEntryRender
                        readonly={sending}
                        ref={PluginEntry}
                        isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
                    />
                </div>
                <div className={cx(classes.flex, classes.between)}>
                    <EncryptionTargetSelector
                        target={encryptionKind}
                        e2eDisabled={props.e2eEncryptionDisabled(encodingKind)}
                        selectedRecipientLength={recipients.length}
                        onClick={(target) => {
                            setEncryptionKind(target)
                            if (target === EncryptionTargetType.E2E) {
                                Telemetry.captureEvent(EventType.Interact, EventID.EntryMaskComposeVisibleSelected)
                                setSelectRecipientOpen(true)
                            }
                            if (target === EncryptionTargetType.Public) {
                                Telemetry.captureEvent(EventType.Interact, EventID.EntryMaskComposeVisibleAll)
                            }
                            if (target === EncryptionTargetType.Self) {
                                Telemetry.captureEvent(EventType.Interact, EventID.EntryMaskComposeVisiblePrivate)
                            }
                        }}
                    />

                    <SelectRecipientsUI
                        open={isSelectRecipientOpen}
                        onClose={() => setSelectRecipientOpen(false)}
                        disabled={sending}
                        items={props.recipients}
                        selected={recipients}
                        onSetSelected={setRecipients}
                    />
                </div>
                <div className={cx(classes.flex, classes.between)}>
                    <EncryptionMethodSelector
                        imageDisabled={!props.supportImageEncoding}
                        textDisabled={!props.supportTextEncoding}
                        method={encodingKind}
                        onChange={setEncoding}
                    />
                </div>
            </div>
            <DialogActions className={classes.action}>
                {props.personaAction ?
                    <div className={classes.personaAction}>{props.personaAction}</div>
                :   <div />}
                <div>
                    {props.maxLength ?
                        <CharLimitIndicator value={currentPostSize} max={props.maxLength} />
                    :   null}
                    {props.requireClipboardPermission && !props.hasClipboardPermission ?
                        <Button
                            variant="roundedContained"
                            onClick={props.onRequestClipboardPermission}
                            sx={{ marginRight: 1 }}>
                            <Trans>Enable auto paste</Trans>
                        </Button>
                    :   null}
                    <LoadingButton
                        style={{ opacity: 1 }}
                        disabled={!submitAvailable}
                        loading={sending}
                        loadingPosition="start"
                        variant="roundedContained"
                        onClick={onSubmit}
                        startIcon={<Icons.Send className={classes.icon} />}>
                        <Trans>Encrypt</Trans>
                    </LoadingButton>
                </div>
            </DialogActions>
        </CompositionContext>
    )
}

export enum E2EUnavailableReason {
    // These reasons only applies to E2E encryption.
    NoPersona = 1,
    NoLocalKey = 2,
    NoConnection = 3,
}
function useSetEncryptionKind(props: Pick<CompositionProps, 'e2eEncryptionDisabled'>, encoding: EncryptionMethodType) {
    const [internal_encryptionKind, setEncryptionKind] = useState<EncryptionTargetType>(EncryptionTargetType.Public)
    // TODO: Change to ProfileIdentifier
    const [recipients, setRecipients] = useState<ProfileInformation[]>([])

    let encryptionKind = internal_encryptionKind
    if (encryptionKind === EncryptionTargetType.E2E && recipients.length === 0)
        encryptionKind = EncryptionTargetType.Self
    if (props.e2eEncryptionDisabled(encoding)) encryptionKind = EncryptionTargetType.Public

    return {
        recipients,
        setRecipients,
        encryptionKind,
        setEncryptionKind,
    }
}

function useEncryptionEncode(props: Pick<CompositionProps, 'supportImageEncoding' | 'supportTextEncoding'>) {
    const [encoding, setEncoding] = useState<EncryptionMethodType>(
        props.supportTextEncoding ? EncryptionMethodType.Text : EncryptionMethodType.Image,
    )

    const imagePayloadSelected =
        props.supportImageEncoding && (encoding === EncryptionMethodType.Image || !props.supportTextEncoding)
    // XOR
    const imagePayloadReadonly =
        (props.supportImageEncoding && !props.supportTextEncoding) ||
        (!props.supportImageEncoding && props.supportTextEncoding)
    const imagePayloadVisible = props.supportImageEncoding
    const encodingKind = imagePayloadSelected ? EncryptionMethodType.Image : EncryptionMethodType.Text

    return {
        encodingKind,
        imagePayloadSelected,
        imagePayloadReadonly,
        imagePayloadVisible,
        setEncoding,
    }
}
