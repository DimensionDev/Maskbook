import { Box, makeStyles } from '@material-ui/core'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { MaskTextField } from '../TextField'
import { CountdownButton } from '../CountdownButton'

const useStyles = makeStyles({
    container: {},
    field: {
        paddingRight: '10px',
        flex: 1,
    },
})

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
    const classes = useStyles()
    const [code, setCode] = useState<string>('')

    useEffect(() => {
        onChange && onChange(code)
    }, [code])

    return (
        <div>
            <div>{label}</div>
            <div className={classes.container}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div className={classes.field}>
                        <MaskTextField
                            size="small"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            error={!!errorMessage}
                            helperText={errorMessage}
                            onBlur={() => onBlur && onBlur(code)}
                            disabled={disabled}
                        />
                    </div>
                    <CountdownButton
                        size="medium"
                        sx={{ height: '40px', width: '100px' }}
                        onClick={onSend}
                        disabled={disabled}>
                        {buttonWording}
                    </CountdownButton>
                </Box>
            </div>
        </div>
    )
}
