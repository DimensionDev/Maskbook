import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icons } from '@masknet/icons'
import { CompositionContext } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import type { SerializableTypedMessages, TypedMessage } from '@masknet/typed-message'
import { LoadingButton } from '@mui/lab'
import { DialogActions, Typography, alpha } from '@mui/material'
import { CharLimitIndicator } from './CharLimitIndicator.js'
import { PluginEntryRender, type PluginEntryRenderRef } from './PluginEntryRender.js'
import { TypedMessageEditor, type TypedMessageEditorRef } from './TypedMessageEditor.js'
import { CrossIsolationMessages, EMPTY_OBJECT } from '@masknet/shared-base'
import { Trans } from '@lingui/macro'

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
        color: theme.palette.text.secondary,
        marginRight: 12,
    },
    editorWrapper: {
        flex: 1,
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
    const [initialMeta, setInitialMeta] = useState<Record<string, unknown>>(EMPTY_OBJECT)
    const [currentPostSize, __updatePostSize] = useState(0)

    const Editor = useRef<TypedMessageEditorRef | null>(null)
    const PluginEntry = useRef<PluginEntryRenderRef>(null)

    const [sending, setSending] = useState(false)

    const updatePostSize = useCallback((size: number) => {
        startTransition(() => __updatePostSize(size))
    }, [])

    const reset = useCallback(() => {
        startTransition(() => {
            Editor.current?.reset()
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
        if (!initialMeta || !Editor.current) return
        for (const [meta, data] of Object.entries(initialMeta)) {
            Editor.current.attachMetadata(meta, data)
        }
    }, [initialMeta, Editor.current])

    const context = useMemo(
        (): CompositionContext => ({
            type: 'popup',
            getMetadata: () => Editor.current?.value.meta,
            attachMetadata: (meta, data) => Editor.current?.attachMetadata(meta, data),
            dropMetadata: (meta) => Editor.current?.dropMetadata(meta),
        }),
        [],
    )

    const submitAvailable = currentPostSize > 0 && currentPostSize < (props.maxLength ?? Number.POSITIVE_INFINITY)
    const onSubmit = useCallback(() => {
        if (!Editor.current) return
        setSending(true)
        props.onSubmit(Editor.current.value).finally(reset)
    }, [props.onSubmit])
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
                    <PluginEntryRender readonly={sending} ref={PluginEntry} isOpenFromApplicationBoard={false} />
                </div>
            </div>
            <DialogActions className={classes.action}>
                <div>
                    {props.maxLength ?
                        <CharLimitIndicator value={currentPostSize} max={props.maxLength} />
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
