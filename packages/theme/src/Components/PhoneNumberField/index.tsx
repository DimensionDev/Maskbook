import { Box, makeStyles } from '@material-ui/core'
import { MaskTextField } from '../TextField'
import { ChangeEvent, ReactNode, useState } from 'react'

const useStyles = makeStyles({
    country: {
        width: '120px',
        marginRight: '10px',
    },
    phone: {
        width: '100%',
    },
})

export interface PhoneNumberFieldValue {
    country: string
    phone: string
}

export interface PhoneNumberFieldProps {
    label?: ReactNode
    countryPlaceholder?: string
    phoneErrorMessage?: string
    error?: boolean
    value: PhoneNumberFieldValue
    onBlur?(value: PhoneNumberFieldValue): void
}

// todo: remove regex, 123123d
export const phoneRegexp = /(\+?( |-|\.)?\d{1,2}( |-|\.)?)?(\(?\d{3}\)?|\d{3})( |-|\.)?(\d{3}( |-|\.)?\d{4})/

export const PhoneNumberField = ({
    label,
    value,
    error,
    onBlur,
    countryPlaceholder = '+1',
    phoneErrorMessage = 'The phone number is incorrect.',
}: PhoneNumberFieldProps) => {
    const classes = useStyles()
    const [phone, setPhone] = useState<string>(value.phone)
    const [countryCode, setCountryCode] = useState<string>(value.country)
    const [invalidPhone, setInvalidPhone] = useState(false)

    const handleCountryCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value
        const prefix = /^\+/.test(inputValue) ? '' : '+'
        setCountryCode(prefix + inputValue)
    }

    const validCheck = () => {
        if (!phone) return

        const isValid = phoneRegexp.test(countryCode + phone)

        if (isValid) {
            onBlur &&
                onBlur({
                    country: countryCode,
                    phone: phone,
                })
        }
        setInvalidPhone(!isValid)
    }

    return (
        <div>
            {label}
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <div className={classes.country}>
                    <MaskTextField
                        value={countryCode}
                        onChange={handleCountryCodeChange}
                        variant="outlined"
                        placeholder={countryPlaceholder}
                    />
                </div>
                <div className={classes.phone}>
                    <MaskTextField
                        fullWidth
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        onBlur={validCheck}
                        type="text"
                        error={invalidPhone || error}
                        helperText={invalidPhone || error ? phoneErrorMessage : ''}
                    />
                </div>
            </Box>
        </div>
    )
}
