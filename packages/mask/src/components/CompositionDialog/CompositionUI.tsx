import {
    forwardRef,
    startTransition,
    useCallback,
    useEffect,
    useId,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'
import type { EncryptTargetE2E, EncryptTargetPublic } from '@masknet/encryption'
import { Icons } from '@masknet/icons'
import { CompositionContext, type CompositionType } from '@masknet/plugin-infra/content-script'
import { EncryptionTargetType, type ProfileInformation } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { SerializableTypedMessages, TypedMessage } from '@masknet/typed-message'
import { LoadingButton } from '@mui/lab'
import { Button, Checkbox, DialogActions, Typography, alpha } from '@mui/material'
import { useI18N } from '../../utils/index.js'
import { SelectRecipientsUI } from '../shared/SelectRecipients/SelectRecipients.js'
import { CharLimitIndicator } from './CharLimitIndicator.js'
import { EncryptionMethodSelector, EncryptionMethodType } from './EncryptionMethodSelector.js'
import { EncryptionTargetSelector } from './EncryptionTargetSelector.js'
import { PluginEntryRender, type PluginEntryRenderRef } from './PluginEntryRender.js'
import { TypedMessageEditor, type TypedMessageEditorRef } from './TypedMessageEditor.js'
import { PersonaAction } from '@masknet/shared'
import { useCurrentPersona } from '../DataSource/usePersonaConnectStatus.js'

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
    actions: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        padding: 16,
        boxSizing: 'border-box',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        background: theme.palette.background.paper,
    },
    between: {
        justifyContent: 'space-between',
    },
    optionTitle: {
        lineHeight: '18px',
        color: theme.palette.text.secondary,
        marginRight: 12,
    },
    editorWrapper: {
        flex: 1,
        width: 568,
        background: theme.palette.background.input,
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
            theme.palette.mode === 'light'
                ? ' 0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12);',
        background: alpha(theme.palette.maskColor.bottom, 0.8),
        justifyContent: 'space-between',
    },
    persona: {
        padding: 0,
        background: alpha(theme.palette.maskColor.bottom, 0.8),
        width: 'auto',
        boxShadow: 'none',
    },
}))

export interface LazyRecipients {
    request(): void
    recipients?: ProfileInformation[]
}
export interface CompositionProps {
    type: CompositionType
    maxLength?: number
    onSubmit(data: SubmitComposition): Promise<void>
    onChange?(message: TypedMessage): void
    isOpenFromApplicationBoard: boolean
    e2eEncryptionDisabled: E2EUnavailableReason | undefined
    recipients: LazyRecipients
    // Enabled features
    supportTextEncoding: boolean
    supportImageEncoding: boolean
    // Requirements
    requireClipboardPermission?: boolean
    hasClipboardPermission?: boolean
    onRequestClipboardPermission?(): void
    onQueryClipboardPermission?(): void
    version: -38 | -37
    setVersion(version: -38 | -37): void
    initialMetas?: Record<string, unknown>
}
export interface SubmitComposition {
    target: EncryptTargetPublic | EncryptTargetE2E
    content: SerializableTypedMessages
    encode: 'text' | 'image'
    version: -38 | -37
}
export interface CompositionRef {
    setMessage(message: SerializableTypedMessages): void
    setEncryptionKind(kind: EncryptionTargetType): void
    startPlugin(id: string, props?: any): void
    reset(): void
}
export const CompositionDialogUI = forwardRef<CompositionRef, CompositionProps>(function CompositionDialogUI(
    props,
    ref,
) {
    const { classes, cx } = useStyles()
    const { t } = useI18N()
    const id = useId()

    const persona = useCurrentPersona()

    const [currentPostSize, __updatePostSize] = useState(0)

    const [isSelectRecipientOpen, setSelectRecipientOpen] = useState(false)
    const Editor = useRef<TypedMessageEditorRef | null>(null)
    const PluginEntry = useRef<PluginEntryRenderRef>(null)

    const [sending, setSending] = useState(false)

    const updatePostSize = useCallback((size: number) => {
        startTransition(() => __updatePostSize(size))
    }, [])

    const { setEncryptionKind, encryptionKind, recipients, setRecipients } = useSetEncryptionKind(props)
    const { encodingKind, setEncoding } = useEncryptionEncode(props)
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
        if (!props.initialMetas || !Editor.current) return
        for (const [meta, data] of Object.entries(props.initialMetas)) {
            Editor.current.attachMetadata(meta, data)
        }
    }, [props.initialMetas, Editor.current])

    const context = useMemo(
        (): CompositionContext => ({
            type: props.type,
            getMetadata: () => Editor.current?.value.meta,
            attachMetadata: (meta, data) => Editor.current?.attachMetadata(meta, data),
            dropMetadata: (meta) => Editor.current?.dropMetadata(meta),
        }),
        [props.type],
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
                    encryptionKind === EncryptionTargetType.Public
                        ? { type: 'public' }
                        : { type: 'E2E', target: recipients.map((x) => x.identifier) },
                version: props.version,
            })
            .finally(reset)
    }, [encodingKind, encryptionKind, recipients, props.onSubmit, props.version])

    return (
        <CompositionContext.Provider value={context}>
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
                    <Typography className={classes.optionTitle}>{t('plugins')}</Typography>
                    <PluginEntryRender
                        readonly={sending}
                        ref={PluginEntry}
                        isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
                    />
                </div>
                <div className={cx(classes.flex, classes.between)}>
                    <EncryptionTargetSelector
                        target={encryptionKind}
                        e2eDisabled={props.e2eEncryptionDisabled}
                        selectedRecipientLength={recipients.length}
                        onChange={(target) => {
                            setEncryptionKind(target)
                            if (target === EncryptionTargetType.E2E) setSelectRecipientOpen(true)
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
                {process.env.NODE_ENV === 'development' || process.env.channel !== 'stable' ? (
                    <div className={cx(classes.flex, classes.between)}>
                        <Typography component="label" htmlFor={id}>
                            Next generation payload
                        </Typography>
                        <div style={{ flex: 1 }} />
                        <Checkbox
                            id={id}
                            checked={props.version === -37}
                            onChange={() => props.setVersion(props.version === -38 ? -37 : -38)}
                        />
                    </div>
                ) : null}
            </div>
            <DialogActions className={classes.action}>
                <PersonaAction currentPersona={persona} classes={{ bottomFixed: classes.persona }} />
                <div>
                    {props.maxLength ? <CharLimitIndicator value={currentPostSize} max={props.maxLength} /> : null}
                    {props.requireClipboardPermission && !props.hasClipboardPermission ? (
                        <Button
                            variant="roundedContained"
                            onClick={props.onRequestClipboardPermission}
                            sx={{ marginRight: 1 }}>
                            {t('post_dialog_enable_paste_auto')}
                        </Button>
                    ) : null}
                    <LoadingButton
                        style={{ opacity: 1 }}
                        disabled={!submitAvailable}
                        loading={sending}
                        loadingPosition="start"
                        variant="roundedContained"
                        onClick={onSubmit}
                        startIcon={<Icons.Send className={classes.icon} />}>
                        {t('post_dialog__button')}
                    </LoadingButton>
                </div>
            </DialogActions>
        </CompositionContext.Provider>
    )
})

export enum E2EUnavailableReason {
    // These reasons only applies to E2E encryption.
    NoPersona = 1,
    NoLocalKey = 2,
    NoConnection = 3,
}
function useSetEncryptionKind(props: Pick<CompositionProps, 'e2eEncryptionDisabled'>) {
    const [internal_encryptionKind, setEncryptionKind] = useState<EncryptionTargetType>(EncryptionTargetType.Public)
    // TODO: Change to ProfileIdentifier
    const [recipients, setRecipients] = useState<ProfileInformation[]>([])

    let encryptionKind = internal_encryptionKind
    if (encryptionKind === EncryptionTargetType.E2E && recipients.length === 0)
        encryptionKind = EncryptionTargetType.Self
    if (props.e2eEncryptionDisabled) encryptionKind = EncryptionTargetType.Public

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
