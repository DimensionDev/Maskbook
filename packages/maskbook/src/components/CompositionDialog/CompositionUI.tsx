import { forwardRef, useImperativeHandle, useMemo, useRef, useState, startTransition, useCallback } from 'react'
import { Typography, Chip } from '@material-ui/core'
import { LoadingButton } from '@material-ui/lab'
import { makeTypedMessageText, TypedMessage } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Send } from '@material-ui/icons'
import { PluginEntryRender, PluginEntryRenderRef } from './PluginEntryRender'
import { TypedMessageEditor, TypedMessageEditorRef } from './TypedMessageEditor'
import { CharLimitIndicator } from './CharLimitIndicator'
import { Flags, useI18N, useValueRef } from '../../utils'
import { debugModeSetting } from '../../settings/settings'
import { ClickableChip } from '../shared/SelectRecipients/ClickableChip'
import { SelectRecipientsUI } from '../shared/SelectRecipients/SelectRecipients'
import type { Profile } from '../../database'
import { CompositionContext } from './CompositionContext'

const useStyles = makeStyles()({
    root: {
        '& > *': {
            marginBottom: `10px !important`,
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
    },
})
const empty = makeTypedMessageText('')

export interface CompositionProps {
    maxLength?: number
    defaultValue?: TypedMessage
    onSubmit(data: SubmitComposition): Promise<void>
    onChange?(message: TypedMessage): void
    disabledRecipients?: undefined | 'E2E' | 'Everyone'
    recipients: Profile[]
    supportTextEncoding: boolean
    supportImageEncoding: boolean
}
export interface SubmitComposition {
    target: 'Everyone' | Profile[]
    content: TypedMessage
    encode: 'text' | 'image'
}
export interface CompositionRef {
    setMessage(message: TypedMessage): void
    setEncryptionKind(kind: 'E2E' | 'Everyone'): void
    startPlugin(id: string): void
    reset(): void
}
export const CompositionDialogUI = forwardRef<CompositionRef, CompositionProps>((props, ref) => {
    const { classes } = useStyles()
    const { t } = useI18N()

    const isDebug = useValueRef(debugModeSetting)
    const [showMetadataDebugger, setShowMetadataDebugger] = useState(false)

    const currentPostMessage = useRef<TypedMessage>(props.defaultValue || empty)
    const [currentPostSize, __updatePostSize] = useState(0)

    const Editor = useRef<TypedMessageEditorRef | null>(null)
    const PluginEntry = useRef<PluginEntryRenderRef>(null)

    const [sending, setSending] = useState(false)

    const updateSize = useCallback((size: number) => {
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
    const encoding = useEncryptionEncode(props)
    const { setEncoding } = encoding

    const reset = useCallback(() => {
        startTransition(() => {
            Editor.current?.reset()
            setEncryptionKind('Everyone')
            setRecipients([])
            setEncoding('text')
            setSending(false)
        })
    }, [])

    useImperativeHandle(
        ref,
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

    const MoreOptions = [
        encoding.imageDisplay && (
            <ClickableChip
                key="image"
                checked={encoding.encoding === 'image'}
                label={
                    <>
                        {t('post_dialog__image_payload')}
                        {Flags.image_payload_marked_as_beta && <sup className={classes.sup}>(Beta)</sup>}
                    </>
                }
                onClick={() => encoding.setEncoding(encoding.encoding === 'image' ? 'text' : 'image')}
                disabled={encoding.imageReadonly}
            />
        ),
        isDebug && (
            <Chip key="debug" label="Post metadata inspector" onClick={() => setShowMetadataDebugger((e) => !e)} />
        ),
    ].filter(Boolean)

    const submitAvailable = currentPostSize > 0 && currentPostSize < (props.maxLength ?? Infinity)

    const context = useMemo(
        (): CompositionContext => ({
            attachMetadata: (meta, data) => Editor.current?.attachMetadata(meta, data),
            dropMetadata: (meta) => Editor.current?.dropMetadata(meta),
        }),
        [],
    )
    const onSubmit = useCallback(() => {
        if (!Editor.current) return
        setSending(true)
        props
            .onSubmit({
                content: Editor.current.value,
                encode: encoding.encoding,
                target: encryptionKind === 'E2E' ? recipients : 'Everyone',
            })
            .finally(reset)
    }, [encoding.encoding, encryptionKind, recipients])
    return (
        <CompositionContext.Provider value={context}>
            <div className={classes.root}>
                <TypedMessageEditor
                    readonly={sending}
                    debugMetadataInspector={showMetadataDebugger}
                    ref={(e) => {
                        Editor.current = e
                        e && updateSize(e.estimatedLength)
                    }}
                    onChange={(message) => {
                        startTransition(() => props.onChange?.(message))
                        updateSize(Editor.current?.estimatedLength || 0)
                    }}
                    defaultValue={props.defaultValue}
                />

                <Typography>
                    Plugins <sup>(Experimental)</sup>
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
                        label={t('post_dialog__select_recipients_only_myself')}
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

    const imageSelected = props.supportImageEncoding && (encoding === 'image' || !props.supportTextEncoding)
    // XOR
    const imageReadonly =
        (props.supportImageEncoding && !props.supportTextEncoding) ||
        (!props.supportImageEncoding && props.supportTextEncoding)
    const imageDisplay = props.supportImageEncoding
    const actualEncoding: typeof encoding = imageSelected ? 'image' : 'text'

    return {
        encoding: actualEncoding,
        imageSelected,
        imageReadonly,
        imageDisplay,
        setEncoding,
    }
}
