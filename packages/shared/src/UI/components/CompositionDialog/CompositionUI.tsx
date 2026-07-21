import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icons } from '@masknet/icons'
import { CompositionContext } from '@masknet/plugin-infra/content-script'
import { alpha, makeStyles  } from '@masknet/theme'
import type { SerializableTypedMessages, TypedMessage } from '@masknet/typed-message'
import { Button, DialogActions, Typography } from '@mui/material'
import { CharLimitIndicator } from './CharLimitIndicator.js'
import { PluginEntryRender, type PluginEntryRenderRef } from './PluginEntryRender.js'
import { TypedMessageEditor, type TypedMessageEditorRef } from './TypedMessageEditor.js'
import { CrossIsolationMessages, EMPTY_OBJECT } from '@masknet/shared-base'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        '& > *': {
            gap: 8,
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
    optionTitle: {
        lineHeight: '18px',
        fontSize: 14,
        color: theme.vars.palette.text.secondary,
        marginRight: 12,
    },
    editorWrapper: {
        flex: 1,
        background: theme.vars.palette.maskColor.bottom,
        padding: 0,
        boxSizing: 'border-box',
        borderRadius: 8,
        marginBottom: 16,
    },
    icon: {
        width: 18,
        height: 18,
        fill: theme.vars.palette.text.buttonText,
    },
    action: {
        height: 68,
        padding: '0 16px',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        ...theme.applyStyles('dark', { boxShadow: '0px 0px 20px rgba(255, 255, 255, 0.12)' }),
        background: alpha(theme.vars.palette.maskColor.bottom, 0.8),
        justifyContent: 'end',
        display: 'flex',
    },
}))

export interface CompositionProps {
    maxLength?: number
    onSubmit(data: SerializableTypedMessages): Promise<void>
    onChange?(message: TypedMessage): void
}
export interface CompositionRef {
    setMessage(message: SerializableTypedMessages): void
    startPlugin(id: string, props?: any): void
    reset(): void
}
export function CompositionDialogUI(props: CompositionProps) {
    const { classes } = useStyles()
    const [initialMeta, setInitialMeta] = useState<{ [property: string]: unknown }>(EMPTY_OBJECT)
    const [currentPostSize, __updatePostSize] = useState(0)

    const EditorRef = useRef<TypedMessageEditorRef | null>(null)
    const PluginEntryRef = useRef<PluginEntryRenderRef>(null)

    const [sending, setSending] = useState(false)

    const updatePostSize = useCallback((size: number) => {
        startTransition(() => __updatePostSize(size))
    }, [])

    const reset = useCallback(() => {
        startTransition(() => {
            EditorRef.current?.reset()
            setSending(false)
        })
        setInitialMeta(EMPTY_OBJECT)
    }, [])

    useEffect(() => {
        return CrossIsolationMessages.events.compositionDialogEvent.on(({ reason, open, content, options }) => {
            setInitialMeta(options?.initialMeta ?? EMPTY_OBJECT)
        })
    }, [])

    useEffect(() => {
        if (!initialMeta || !EditorRef.current) return
        for (const [meta, data] of Object.entries(initialMeta)) {
            EditorRef.current.attachMetadata(meta, data)
        }
    }, [initialMeta, EditorRef.current])

    const context = useMemo(
        (): CompositionContext => ({
            type: 'popup',
            getMetadata: () => EditorRef.current?.value.meta,
            attachMetadata: (meta, data) => EditorRef.current?.attachMetadata(meta, data),
            dropMetadata: (meta) => EditorRef.current?.dropMetadata(meta),
        }),
        [],
    )

    const submitAvailable = currentPostSize > 0 && currentPostSize < (props.maxLength ?? Infinity)
    const onSubmit = useCallback(() => {
        if (!EditorRef.current) return
        setSending(true)
        props.onSubmit(EditorRef.current.value).finally(reset)
    }, [props.onSubmit])
    return (
        <CompositionContext value={context}>
            <div className={classes.root}>
                <div className={classes.editorWrapper}>
                    <TypedMessageEditor
                        autoFocus
                        readonly={sending}
                        ref={(element) => {
                            EditorRef.current = element
                            if (element) updatePostSize(element.estimatedLength)
                        }}
                        onChange={(message) => {
                            startTransition(() => props.onChange?.(message))
                            updatePostSize(EditorRef.current?.estimatedLength || 0)
                        }}
                    />
                </div>

                <div className={classes.flex}>
                    <Typography className={classes.optionTitle}>
                        <Trans>Plugins</Trans>
                    </Typography>
                    <PluginEntryRender readonly={sending} ref={PluginEntryRef} isOpenFromApplicationBoard={false} />
                </div>
            </div>
            <DialogActions className={classes.action}>
                <div>
                    {props.maxLength ?
                        <CharLimitIndicator value={currentPostSize} max={props.maxLength} />
                    :   null}
                    <Button
                        style={{ opacity: 1 }}
                        disabled={!submitAvailable}
                        loading={sending}
                        loadingPosition="start"
                        variant="roundedContained"
                        onClick={onSubmit}
                        startIcon={<Icons.Send className={classes.icon} />}>
                        <Trans>Encrypt</Trans>
                    </Button>
                </div>
            </DialogActions>
        </CompositionContext>
    )
}
