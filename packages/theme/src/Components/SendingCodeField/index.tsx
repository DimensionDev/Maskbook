import { useRef, useEffect, useState, type ReactNode } from 'react'
import { type MaskTextFieldProps } from '../TextField/index.js'
import { CountdownButton } from '../CountdownButton/index.js'
import { makeStyles } from '../../UIHelper/index.js'
import { TextField } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    countdown: {
        fontSize: 14,
        color: theme.palette.maskColor.main,
        whiteSpace: 'nowrap',
        height: 24,
        boxSizing: 'border-box',
    },
}))

export interface SendingCodeFieldProps extends Omit<MaskTextFieldProps, 'onChange' | 'onBlur'> {
    sendButtonText?: ReactNode
    errorMessage?: ReactNode
    autoSend?: boolean
    resendDisabled?: boolean
    onBlur?(code: string): void
    onChange?(code: string): void
    onSend?(): void
}
export function SendingCodeField({
    onSend,
    sendButtonText = 'Send',
    errorMessage,
    onBlur,
    disabled = false,
    resendDisabled,
    autoSend = false,
    onChange,
    ...rest
}: SendingCodeFieldProps) {
    const { classes } = useStyles()
    const [code, setCode] = useState('')
    const sendButton = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (autoSend) sendButton.current?.click()
    }, [autoSend])

    return (
        <TextField
            size="small"
            value={code}
            onChange={(event) => {
                setCode(event.target.value)
                onChange?.(event.target.value)
            }}
            error={!!errorMessage}
            helperText={errorMessage}
            onBlur={() => onBlur?.(code)}
            disabled={disabled}
            InputProps={{
                disableUnderline: true,
                endAdornment: (
                    <CountdownButton
                        ref={sendButton}
                        className={classes.countdown}
                        size="small"
                        variant="text"
                        sx={{ px: 0 }}
                        onClick={onSend}
                        disabled={resendDisabled || disabled}>
                        {sendButtonText}
                    </CountdownButton>
                ),
            }}
            {...rest}
        />
    )
}
