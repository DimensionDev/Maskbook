import {
    isTypedMessageEqual,
    isTypedMessageText,
    makeTypedMessageText,
    TypedMessage,
    SerializableTypedMessages,
} from '@masknet/typed-message'
import { editTypedMessageMeta } from '@masknet/typed-message/dom'
import { makeStyles } from '@masknet/theme'
import { InputBase, Alert, Button } from '@mui/material'
import { useCallback, useImperativeHandle, useState, useRef, forwardRef, memo, useMemo } from 'react'
import { useI18N } from '../../utils/index.js'
import { BadgeRenderer } from './BadgeRenderer.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: 0,
    },
    input: {
        fontSize: 15,
        height: 338,
        position: 'relative',
    },
    badgeInput: {
        paddingTop: 48,
    },
    textarea: {
        padding: '0 14px!important',
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
export interface TypedMessageEditorProps {
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
export const TypedMessageEditor = memo(
    forwardRef<TypedMessageEditorRef, TypedMessageEditorProps>((props, ref) => {
        const { onChange, readonly } = props
        const { classes, cx } = useStyles()
        const { t } = useI18N()

        const [value, setValue] = useState(props.defaultValue ?? emptyMessage)
        const currentValue = useRef(value)
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
                            {t('reset')} {t('editor')}
                        </Button>
                    }>
                    {t('typed_message_text_alert')}
                </Alert>
            )
        }
        return (
            <>
                <InputBase
                    startAdornment={
                        value.meta && (
                            <div className={classes.badge}>
                                <BadgeRenderer readonly={!!readonly} meta={value.meta} onDeleteMeta={deleteMetaID} />
                            </div>
                        )
                    }
                    readOnly={readonly}
                    classes={{
                        root: classes.root,
                        input: classes.textarea,
                    }}
                    className={cx(classes.input, value.meta ? classes.badgeInput : undefined)}
                    autoFocus={props.autoFocus}
                    value={value.content}
                    onChange={setAsText}
                    fullWidth
                    multiline
                    placeholder={t('post_dialog__placeholder')}
                    rows={value.meta ? 12 : 14}
                />
            </>
        )
    }),
)
