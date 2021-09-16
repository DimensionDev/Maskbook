import { Box, Stack } from '@material-ui/core'
import { ReactNode, useRef } from 'react'
import { useEffect, useState } from 'react'
import { MaskTextField } from '../TextField'
import { CountdownButton } from '../CountdownButton'

export interface SendingCodeFieldProps {
    label?: ReactNode
    sendButtonText?: string
    errorMessage?: string
    disabled?: boolean
    autoSend?: boolean
    onBlur?(code: string): void
    onChange?(code: string): void
    onSend?(): void
}
export const SendingCodeField = ({
    onSend,
    sendButtonText = 'Send',
    label,
    errorMessage,
    onBlur,
    disabled = false,
    autoSend = false,
    onChange,
}: SendingCodeFieldProps) => {
    const [code, setCode] = useState<string>('')
    const sendButton = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        onChange?.(code)
    }, [code])

    useEffect(() => {
        if (autoSend) sendButton.current?.click()
    }, [autoSend])

    return (
        <Box>
            <Box>{label}</Box>
            <Box>
                <Stack alignItems="flex-start" direction="row" spacing={1}>
                    <Box flex={1}>
                        <MaskTextField
                            size="small"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            error={!!errorMessage}
                            helperText={errorMessage}
                            onBlur={() => onBlur?.(code)}
                            disabled={disabled}
                        />
                    </Box>
                    <CountdownButton
                        ref={sendButton}
                        size="medium"
                        sx={{ height: '40px', width: '100px' }}
                        onClick={onSend}
                        disabled={disabled}>
                        {sendButtonText}
                    </CountdownButton>
                </Stack>
            </Box>
        </Box>
    )
}
