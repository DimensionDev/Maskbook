import { isTypedMessageEqual, isTypedMessageText, makeTypedMessageText, TypedMessage } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { InputBase, Alert, Button } from '@mui/material'
import { useCallback, useImperativeHandle, useState } from 'react'
import { useRef } from 'react'
import { forwardRef, memo } from 'react'
import { editTypedMessageMeta } from '../../protocols/typed-message'
import { useI18N } from '../../utils'
import { BadgeRenderer } from './BadgeRenderer'

const useStyles = makeStyles()({
    root: {
        minHeight: 108,
        flexDirection: 'column',
        padding: 10,
        boxSizing: 'border-box',
    },
    input: {
        fontSize: 18,
        minHeight: '8em',
    },
})
export interface TypedMessageEditorProps {
    defaultValue?: TypedMessage
    onChange?(message: TypedMessage): void
    readonly?: boolean
    autoFocus?: boolean
}
export interface TypedMessageEditorRef {
    /** Current message, it is a getter/setter. */
    value: TypedMessage
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
        const { classes } = useStyles()
        const { t } = useI18N()

        const [value, setValue] = useState(props.defaultValue ?? emptyMessage)
        const currentValue = useRef(value)
        currentValue.current = value

        const setMessage = useCallback(
            (value: TypedMessage) => {
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
            (meta) => {
                setMessage(editTypedMessageMeta(currentValue.current, (map) => map.delete(meta)))
            },
            [setMessage],
        )
        useImperativeHandle(
            ref,
            (): TypedMessageEditorRef => {
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
            },
            [setMessage, deleteMetaID],
        )

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
                <BadgeRenderer readonly={!!readonly} meta={value.meta} onDeleteMeta={deleteMetaID} />
                <InputBase
                    readOnly={readonly}
                    classes={{
                        root: classes.root,
                        input: classes.input,
                    }}
                    autoFocus={props.autoFocus}
                    value={value.content}
                    onChange={setAsText}
                    fullWidth
                    multiline
                    placeholder={t('post_dialog__placeholder')}
                />
            </>
        )
    }),
)
