import { useLingui } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { COUNTRIES, type COUNTRY } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { Button, TextField, Typography, type FilledTextFieldProps, type InputBaseProps } from '@mui/material'
import { useMemo, useState } from 'react'
import { getCountryFlag } from '../../../index.js'
import { CountryCodePicker } from '../CountryCodePicker/index.js'

const useStyles = makeStyles()(() => ({
    button: {
        padding: 0,
    },
}))

export interface PhoneNumberFieldProps extends Omit<FilledTextFieldProps, 'variant'> {
    code: string
    onCodeChange: (code: string) => void
    InputProps?: Partial<InputBaseProps>
}

export function PhoneNumberField({ code, onCodeChange, ...rest }: PhoneNumberFieldProps) {
    const { classes } = useStyles()
    const { t } = useLingui()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const countryIcon = useMemo(() => {
        if (!code) return
        const country = (COUNTRIES as COUNTRY[]).find((x) => x.dialing_code === code)
        if (!country) return
        return getCountryFlag(country.iso_code)
    }, [code])

    return (
        <>
            <TextField
                placeholder={t`Phone Number`}
                type="tel"
                {...rest}
                slotProps={{
                    input: {
                        ...rest.InputProps,
                        disableUnderline: true,
                        startAdornment: (
                            <Button
                                className={classes.button}
                                variant="text"
                                onClick={(event) => setAnchorEl(event.currentTarget)}>
                                <img src={countryIcon} style={{ width: 16, height: 12 }} />
                                <Typography component="span" sx={{ minWidth: 32, mx: 0.5, textAlign: 'right' }}>
                                    +{code}
                                </Typography>
                                <Icons.ArrowDrop size={16} />
                            </Button>
                        ),
                    },
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
