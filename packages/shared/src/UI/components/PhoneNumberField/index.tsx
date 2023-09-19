import { useMemo, useState } from 'react'
import { Button, TextField, type FilledTextFieldProps, Typography, ClickAwayListener } from '@mui/material'
import { COUNTRIES } from '@masknet/shared-base-ui'
import { getCountryFlag, useSharedI18N } from '../../../index.js'
import { Icons } from '@masknet/icons'
import { CountryCodePicker } from '../CountryCodePicker/index.js'

export interface PhoneNumberFieldProps extends Omit<FilledTextFieldProps, 'variant'> {
    code: string
    onCodeChange: (code: string) => void
}

export function PhoneNumberField({ code, onCodeChange, ...rest }: PhoneNumberFieldProps) {
    const t = useSharedI18N()
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
                placeholder={t.mobile_number()}
                type="tel"
                {...rest}
                InputProps={{
                    ...rest.InputProps,
                    disableUnderline: true,
                    startAdornment: (
                        <Button variant="text" onClick={(event) => setAnchorEl(event.currentTarget)}>
                            <img src={countryIcon} style={{ width: 16, height: 12 }} />
                            <Typography component="span">+{code}</Typography>
                            <Icons.ArrowDrop size={16} />
                        </Button>
                    ),
                }}
            />
            <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                <CountryCodePicker
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    code={code}
                    onClose={(code) => {
                        if (code) onCodeChange(code)
                        setAnchorEl(null)
                    }}
                />
            </ClickAwayListener>
        </>
    )
}
