import { List, ListItemButton, ListItemIcon, ListItemText, Popover, TextField, Typography } from '@mui/material'
import { memo, useDeferredValue, useMemo, useState } from 'react'
import { useDashboardI18N } from '../../locales/i18n_generated.js'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import Fuse from 'fuse.js'

import REGIONS from '../../assets/region.json'
import { COUNTRY_ICON_URL } from '../../constants.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(2),
        borderRadius: 8,
        width: 320,
        height: 316,
        background: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 4px 30px 0px rgba(255, 255, 255, 0.15)'
                : '0px 4px 30px 0px rgba(0, 0, 0, 0.10)',
    },
    list: {
        maxHeight: 240,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    icon: {
        width: 21,
        height: 15,
        borderRadius: 3,
    },
    listItemIcon: {
        minWidth: 21,
        marginRight: 4,
    },
    listItem: {
        padding: 6,
        borderRadius: 8,
        marginBottom: 12,
        ['&:last-child']: {
            marginBottom: 0,
        },
    },
    text: {
        margin: 0,
    },
    primaryText: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
}))

export interface CountryCodePickerProps {
    open: boolean
    anchorEl: HTMLElement | null
    code: string
    onClose: (code?: string) => void
}

export const CountryCodePicker = memo<CountryCodePickerProps>(({ open, anchorEl, onClose, code }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const [query, setQuery] = useState('')
    const deferredQuery = useDeferredValue(query)

    const regions = useMemo(() => {
        if (!deferredQuery) return REGIONS
        const fuse = new Fuse(REGIONS, {
            shouldSort: false,
            isCaseSensitive: false,
            threshold: 0.45,
            minMatchCharLength: 1,
            findAllMatches: true,
            keys: ['name'],
        })

        const filtered = fuse.search(deferredQuery)
        return filtered.map((x) => x.item)
    }, [deferredQuery])

    return (
        <Popover
            disableScrollLock
            anchorEl={anchorEl}
            open={open}
            onClose={() => {
                onClose()
            }}
            classes={{ paper: classes.paper }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}>
            <TextField
                fullWidth
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.search_area()}
                InputProps={{ disableUnderline: true, startAdornment: <Icons.Search size={16} />, size: 'small' }}
                sx={{ marginBottom: 0.5 }}
            />
            <List className={classes.list} data-hide-scrollbar>
                {regions.map((data) => {
                    const selected = data.dial_code === code
                    const icon = `${COUNTRY_ICON_URL}${code.toLowerCase()}.svg`
                    return (
                        <ListItemButton
                            onClick={() => {
                                onClose(data.dial_code)
                            }}
                            key={data.code}
                            className={classes.listItem}
                            autoFocus={selected}
                            selected={selected}>
                            <ListItemIcon className={classes.listItemIcon}>
                                <img src={icon} className={classes.icon} />
                                {/* {createElement(icon, { className: classes.icon })} */}
                            </ListItemIcon>
                            <ListItemText
                                primary={data.name}
                                className={classes.text}
                                classes={{ primary: classes.primaryText }}
                            />
                            <Typography className={classes.primaryText}>{data.dial_code}</Typography>
                        </ListItemButton>
                    )
                })}
            </List>
        </Popover>
    )
})
