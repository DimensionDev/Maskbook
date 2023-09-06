import { Icons } from '@masknet/icons'
import {
    Autocomplete,
    Button,
    ClickAwayListener,
    ListItem,
    ListItemIcon,
    ListItemText,
    Popover,
    Typography,
    type InputBaseProps,
    type PopoverProps,
    type Popper,
} from '@mui/material'
import Fuse from 'fuse.js'
import guessCallingCode from 'guess-calling-code'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { makeStyles } from '../../UIHelper/makeStyles.js'
import { MaskTextField } from '../TextField/index.js'
import dialingData from './country-dialing-data.json'

interface DialingRecord {
    country_region: string
    iso_code: string
    dialing_code: string
}

const useStyles = makeStyles()((theme) => ({
    openButton: {
        height: 18,
        boxSizing: 'border-box',
        padding: 0,
        marginRight: 9,
        minWidth: 'auto',
    },
    dropIcon: {
        flexShrink: 0,
    },
    listItem: {
        height: 40,
        borderRadius: 8,
        boxSizing: 'border-box',
        marginBottom: theme.spacing(1.5),
        backgroundColor: theme.palette.maskColor.bottom,
    },
    itemText: {
        fontSize: 14,
        fontWeight: 700,
    },
    popoverPaper: {
        width: 350,
        boxSizing: 'border-box',
        padding: theme.spacing(2),
        borderRadius: 24,
        backgroundColor: theme.palette.maskColor.bottom,
        backgroundImage: 'none',
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 4px 30px 0px rgba(0, 0, 0, 0.10)'
                : '0px 4px 30px 0px rgba(255, 255, 255, 0.15)',
    },
    autocompletePaper: {
        boxShadow: 'none',
        backgroundColor: theme.palette.maskColor.bottom,
    },
    listbox: {
        border: 'none',
        boxShadow: 'none',
        maxHeight: 320,
        marginTop: theme.spacing(1),
        backgroundColor: theme.palette.maskColor.bottom,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    itemIcon: {
        marginRight: theme.spacing(0.5),
        color: theme.palette.maskColor.second,
        minWidth: 'unset',
    },
    flag: {
        width: 21,
        height: 15,
        objectFit: 'cover',
    },
    roundedFlag: {
        borderRadius: 3,
    },
    dialingCode: {
        width: 33,
        fontSize: 13,
        color: theme.palette.maskColor.main,
        flexShrink: 0,
        textAlign: 'right',
        marginRight: theme.spacing(0.5),
    },
}))

export interface PhoneNumberFieldValue {
    /** e.g. United States */
    country?: string
    dialingCode?: string
    phone: string
}

const getFlag = (code: string) => `http://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`

function PopperComponent(props: PopoverProps) {
    const { disablePortal, anchorEl, open, ...other } = props
    return <div {...other} />
}

export interface PhoneNumberFieldProps {
    placeholder?: string
    error?: string
    value: PhoneNumberFieldValue
    onBlur?: InputBaseProps['onBlur']
    onChange?(value: PhoneNumberFieldValue): void
}

export function PhoneNumberField({ value, error, placeholder, onBlur, onChange }: PhoneNumberFieldProps) {
    const { classes, cx } = useStyles()
    const countryConfig = useMemo(() => {
        if (value.country) {
            return dialingData.find((x) => x.country_region === value.country)
        } else {
            const callingCode = guessCallingCode()
            const code = value.dialingCode || callingCode
            // Get the first match country
            return dialingData.find((x) => x.dialing_code === code)
        }
    }, [value.country])

    const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value
        onChange?.({ ...value, phone: inputValue })
    }
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleOpenList = () => {
        setAnchorEl(buttonRef.current)
    }
    const [keyword, setKeyword] = useState('')
    const fuse = useMemo(() => {
        return new Fuse(dialingData, {
            keys: ['country_region', 'iso_code', 'dialing_code'],
        })
    }, [])
    const countries = useMemo(() => {
        if (!keyword.trim()) return dialingData
        return fuse.search(keyword).map((x) => x.item)
    }, [keyword, fuse])

    return (
        <>
            <MaskTextField
                fullWidth
                autoFocus
                value={value.phone}
                onChange={handlePhoneChange}
                onBlur={onBlur}
                type="text"
                error={!!error}
                helperText={error}
                ref={buttonRef}
                size="small"
                placeholder={placeholder}
                InputProps={{
                    startAdornment: (
                        <Button onClick={handleOpenList} className={classes.openButton} variant="text" size="small">
                            {countryConfig ? (
                                <>
                                    <img className={classes.flag} src={getFlag(countryConfig?.iso_code)} />
                                    <Typography className={classes.dialingCode}>
                                        +{countryConfig.dialing_code}
                                    </Typography>
                                    <Icons.ArrowDrop className={classes.dropIcon} size={16} />
                                </>
                            ) : (
                                'Select'
                            )}
                        </Button>
                    ),
                }}
            />
            <Popover
                open={!!anchorEl}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                classes={{ paper: classes.popoverPaper }}>
                <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                    <Autocomplete<DialingRecord>
                        open
                        options={countries}
                        classes={{
                            listbox: classes.listbox,
                            paper: classes.autocompletePaper,
                        }}
                        renderInput={(params) => (
                            <MaskTextField
                                placeholder="Search Area"
                                value={keyword}
                                autoFocus
                                fullWidth
                                InputProps={{
                                    ref: params.InputProps.ref,
                                    style: { height: 40, borderRadius: 8, padding: 8 },
                                    inputProps: { ...params.inputProps, style: { paddingLeft: 4 } },
                                    startAdornment: <Icons.Search size={18} />,
                                    endAdornment: keyword ? (
                                        <Icons.Close size={18} onClick={() => setKeyword('')} />
                                    ) : null,
                                }}
                                onChange={(event) => setKeyword(event.currentTarget.value)}
                            />
                        )}
                        renderTags={() => null}
                        getOptionLabel={(option) => option.country_region}
                        PopperComponent={PopperComponent as unknown as typeof Popper}
                        renderOption={(props, record) => (
                            <ListItem
                                {...props}
                                className={cx(props.className, classes.listItem)}
                                key={record.country_region}
                                secondaryAction={
                                    <Typography className={classes.itemText}>+{record.dialing_code}</Typography>
                                }>
                                <ListItemIcon className={classes.itemIcon}>
                                    <img
                                        className={cx(classes.flag, classes.roundedFlag)}
                                        src={getFlag(record.iso_code)}
                                    />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography className={classes.itemText}>{record.country_region}</Typography>
                                </ListItemText>
                            </ListItem>
                        )}
                        onChange={(_, record) => {
                            if (!record?.dialing_code) return
                            onChange?.({ ...value, country: record.country_region, dialingCode: record.dialing_code })
                        }}
                    />
                </ClickAwayListener>
            </Popover>
        </>
    )
}
