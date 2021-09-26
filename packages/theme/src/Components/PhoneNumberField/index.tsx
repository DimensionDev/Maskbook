import { Box, InputBaseProps } from '@mui/material'
import { makeStyles } from '../../makeStyles'
import { MaskTextField } from '../TextField'
import { ChangeEvent, ReactNode, useState } from 'react'

const useStyles = makeStyles()({
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
    error?: string
    value: PhoneNumberFieldValue
    onBlur?: InputBaseProps['onBlur']
    onChange?(value: PhoneNumberFieldValue): void
}

export const PhoneNumberField = ({
    label,
    value,
    error,
    onBlur,
    countryPlaceholder = '+1',
    onChange,
}: PhoneNumberFieldProps) => {
    const { classes } = useStyles()
    const [phone, setPhone] = useState<string>(value.phone)
    const [countryCode, setCountryCode] = useState<string>(value.country)

    const handleCountryCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value
        const prefix = inputValue.startsWith('+') ? '' : '+'

        setCountryCode(prefix + inputValue)
        onChange?.({ country: inputValue, phone: phone })
    }

    const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value

        setPhone(inputValue)
        onChange?.({ country: countryCode, phone: inputValue })
    }

    return (
        <div>
            {label}
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <div className={classes.country}>
                    <MaskTextField
                        value={countryCode}
                        onChange={handleCountryCodeChange}
                        placeholder={countryPlaceholder}
                    />
                </div>
                <div className={classes.phone}>
                    <MaskTextField
                        fullWidth
                        value={phone}
                        onChange={handlePhoneChange}
                        onBlur={onBlur}
                        type="text"
                        error={!!error}
                        helperText={error}
                    />
                </div>
            </Box>
        </div>
    )
}
