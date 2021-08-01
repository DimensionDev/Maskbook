import { Box, Stack } from '@material-ui/core'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { MaskTextField } from '../TextField'
import { CountdownButton } from '../CountdownButton'

export interface SendingCodeFieldProps {
    label?: ReactNode
    buttonWording?: string
    errorMessage?: string
    disabled?: boolean
    onBlur?(code: string): void
    onChange?(code: string): void
    onSend?(): void
}
export const SendingCodeField = ({
    onSend,
    buttonWording = 'Send',
    label,
    errorMessage,
    onBlur,
    disabled = false,
    onChange,
}: SendingCodeFieldProps) => {
    const [code, setCode] = useState<string>('')

    useEffect(() => {
        onChange && onChange(code)
    }, [code])

    return (
        <Box>
            <Box>{label}</Box>
            <Box>
                <Stack alignItems="center" direction="row" spacing={1}>
                    <Box flex={1}>
                        <MaskTextField
                            size="small"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            error={!!errorMessage}
                            helperText={errorMessage}
                            onBlur={() => onBlur && onBlur(code)}
                            disabled={disabled}
                        />
                    </Box>
                    <CountdownButton
                        size="medium"
                        sx={{ height: '40px', width: '100px' }}
                        onClick={onSend}
                        disabled={disabled}>
                        {buttonWording}
                    </CountdownButton>
                </Stack>
            </Box>
        </Box>
    )
}
