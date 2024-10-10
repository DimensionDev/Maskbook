import {
    isTypedMessageEqual,
    isTypedMessageText,
    makeTypedMessageText,
    type TypedMessage,
    type SerializableTypedMessages,
} from '@masknet/typed-message'
import { editTypedMessageMeta } from '@masknet/typed-message-react'
import { makeStyles } from '@masknet/theme'
import { InputBase, Alert, Button, inputBaseClasses, alpha } from '@mui/material'
import { useCallback, useImperativeHandle, useState, useRef, memo, useMemo, useEffect, type RefAttributes } from 'react'
import { BadgeRenderer } from './BadgeRenderer.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: 0,
    },
    input: {
        fontSize: 15,
        position: 'relative',
        display: 'flex',
        height: '100%',
        backgroundColor: theme.palette.maskColor.input,
        [`& > .${inputBaseClasses.input}`]: {
            height: 'calc(100% - 22px) !important',
            overflow: 'unset',
        },
        [`&.${inputBaseClasses.focused}`]: {
            backgroundColor: 'transparent',
            border: 0,
            outline: `2px solid ${alpha(theme.palette.maskColor.primary, 0.2)}`,
        },
    },
    badgeInput: {
        paddingTop: 48,
    },
    textarea: {
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.maskColor.secondaryLine,
            backgroundClip: 'padding-box',
        },
    },
    badge: {
        position: 'absolute',
        top: 14,
        left: 14,
    },
}))
export interface TypedMessageEditorProps extends RefAttributes<TypedMessageEditorRef> {
    defaultValue?: SerializableTypedMessages
    onChange?(message: TypedMessage): void
    readonly?: boolean
    autoFocus?: boolean
}
export interface TypedMessageEditorRef {
    /** Current message, it is a getter/setter. */
    value: SerializableTypedMessages
    /** The length of the current message. */
    readonly estimatedLength: number
    focus(): void
    /** Clean the editor. */
    reset(): void
    /**
     * Insert metadata into the current message.
     * Might be async in the future.
     * @param metaID The inserted meta key.
     * @param meta Metadata.
     */
    attachMetadata(metaID: string, meta: unknown): void
    dropMetadata(metaID: string): void
}
const emptyMessage = makeTypedMessageText('')
// This is an **uncontrolled** component. (performance consideration, because it will be re-rendered very frequently).
export const TypedMessageEditor = memo(function TypedMessageEditor(props: TypedMessageEditorProps) {
    const { _ } = useLingui()
    const { onChange, readonly, ref } = props
    const { classes, cx } = useStyles()

    const [value, setValue] = useState(props.defaultValue ?? emptyMessage)
    const currentValue = useRef(value)
    const [inputRef, setInputRef] = useState<{ focus(): void } | null>(null)
    useEffect(() => {
        props.autoFocus && inputRef?.focus()
    }, [props.autoFocus, inputRef])

    currentValue.current = value

    const setMessage = useCallback(
        (value: SerializableTypedMessages) => {
            if (isTypedMessageEqual(currentValue.current, value)) return
            setValue(value)
            currentValue.current = value
            onChange?.(value)
        },
        [onChange],
    )
    const setAsText = useCallback(
        (val: string | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            const text = typeof val === 'string' ? val : val.target.value
            const newValue = makeTypedMessageText(text, currentValue.current.meta)
            setMessage(newValue)
        },
        [setMessage],
    )
    const deleteMetaID = useCallback(
        (meta: string) => {
            setMessage(editTypedMessageMeta(currentValue.current, (map) => map.delete(meta)))
        },
        [setMessage],
    )
    const refItem = useMemo((): TypedMessageEditorRef => {
        return {
            get estimatedLength() {
                // TODO: we should count metadata into the estimated size
                if (isTypedMessageText(currentValue.current)) return currentValue.current.content.length
                return 0
            },
            get value() {
                return currentValue.current
            },
            set value(val) {
                setMessage(val)
            },
            focus: () => inputRef?.focus(),
            reset: () => setMessage(emptyMessage),
            attachMetadata(meta, data) {
                setMessage(editTypedMessageMeta(currentValue.current, (map) => map.set(meta, data)))
            },
            dropMetadata: deleteMetaID,
        }
    }, [setMessage, deleteMetaID])
    useImperativeHandle(ref, () => refItem, [refItem])

    if (!isTypedMessageText(value)) {
        const reset = () => setAsText('')
        // We don't have an rich text editor yet.
        return (
            <Alert
                severity="error"
                action={
                    <Button onClick={reset}>
                        <Trans>Reset</Trans> <Trans>Editor</Trans>
                    </Button>
                }>
                <Trans>Only TypedMessageText is supported currently.</Trans>
            </Alert>
        )
    }
    return (
        <InputBase
            inputRef={setInputRef}
            startAdornment={
                value.meta ?
                    <div className={classes.badge}>
                        <BadgeRenderer readonly={!!readonly} meta={value.meta} onDeleteMeta={deleteMetaID} />
                    </div>
                :   null
            }
            readOnly={readonly}
            classes={{
                root: classes.root,
                input: classes.textarea,
            }}
            className={cx(classes.input, value.meta ? classes.badgeInput : undefined)}
            value={value.content}
            onChange={setAsText}
            fullWidth
            multiline
            placeholder={_(msg`Tell friends what's happening...`)}
            rows={value.meta ? 11 : 13}
        />
    )
})
