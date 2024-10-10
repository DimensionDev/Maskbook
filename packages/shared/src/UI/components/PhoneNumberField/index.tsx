import { useMemo, useState } from 'react'
import { Button, TextField, type FilledTextFieldProps, Typography } from '@mui/material'
import { COUNTRIES } from '@masknet/shared-base-ui'
import { getCountryFlag } from '../../../index.js'
import { Icons } from '@masknet/icons'
import { CountryCodePicker } from '../CountryCodePicker/index.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export interface PhoneNumberFieldProps extends Omit<FilledTextFieldProps, 'variant'> {
    code: string
    onCodeChange: (code: string) => void
}

export function PhoneNumberField({ code, onCodeChange, ...rest }: PhoneNumberFieldProps) {
    const { _ } = useLingui()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const countryIcon = useMemo(() => {
        if (!code) return
        const country = COUNTRIES.find((x) => x.dialing_code === code)
        if (!country) return
        return getCountryFlag(country.iso_code)
    }, [code])

    return (
        <>
            <TextField
                placeholder={_(msg`Phone Number`)}
                type="tel"
                {...rest}
                InputProps={{
                    ...rest.InputProps,
                    disableUnderline: true,
                    startAdornment: (
                        <Button variant="text" onClick={(event) => setAnchorEl(event.currentTarget)}>
                            <img src={countryIcon} style={{ width: 16, height: 12 }} />
                            <Typography component="span" sx={{ minWidth: 32, mx: 0.5, textAlign: 'right' }}>
                                +{code}
                            </Typography>
                            <Icons.ArrowDrop size={16} />
                        </Button>
                    ),
                }}
            />

            <CountryCodePicker
                open={!!anchorEl}
                anchorEl={anchorEl}
                code={code}
                onClose={(code) => {
                    if (code) onCodeChange(code)
                    setAnchorEl(null)
                }}
            />
        </>
    )
}
