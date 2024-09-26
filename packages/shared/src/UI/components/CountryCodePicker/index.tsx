import { List, ListItemButton, ListItemIcon, ListItemText, Popover, TextField, Typography } from '@mui/material'
import { memo, useDeferredValue, useMemo, useState } from 'react'

import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import Fuse from 'fuse.js'
import { EmptyStatus } from '../../../index.js'
import { COUNTRIES, useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { getCountryFlag } from '../../../utils/getCountryFlag.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(2),
        borderRadius: 8,
        width: 320,
        height: 316,
        background: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 4px 30px 0px rgba(255, 255, 255, 0.15)'
            :   '0px 4px 30px 0px rgba(0, 0, 0, 0.10)',
    },
    list: {
        maxHeight: 240,
        overflow: 'auto',
        scrollbarWidth: 'none',
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
    const { _ } = useLingui()
    const { classes } = useStyles()
    const [query, setQuery] = useState<string>()
    const deferredQuery = useDeferredValue(query)

    const regions = useMemo(() => {
        if (!deferredQuery) return COUNTRIES
        const fuse = new Fuse(COUNTRIES, {
            isCaseSensitive: false,
            includeMatches: true,
            threshold: 0.8,
            minMatchCharLength: 1,
            findAllMatches: true,
            keys: ['country_region', 'dialing_code'],
        })

        const filtered = fuse.search(deferredQuery)

        return filtered.map((x) => x.item)
    }, [deferredQuery])

    useRenderPhraseCallbackOnDepsChange(() => {
        setQuery(undefined)
    }, [open])

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
                autoFocus
                onChange={(event) => setQuery(event.target.value)}
                placeholder={_(msg`Search Area`)}
                InputProps={{ disableUnderline: true, startAdornment: <Icons.Search size={16} />, size: 'small' }}
                sx={{ marginBottom: 0.5 }}
            />
            {regions.length ?
                <List className={classes.list} data-hide-scrollbar>
                    {regions.map((data) => {
                        const selected = data.dialing_code === code
                        const icon = getCountryFlag(data.iso_code)

                        return (
                            <ListItemButton
                                onClick={() => {
                                    onClose(data.dialing_code)
                                }}
                                key={`${data.iso_code}+${data.dialing_code}`}
                                className={classes.listItem}
                                selected={query === undefined ? selected : undefined}
                                autoFocus={query === undefined ? selected : undefined}>
                                <ListItemIcon className={classes.listItemIcon}>
                                    <img src={icon} className={classes.icon} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={data.country_region}
                                    className={classes.text}
                                    classes={{ primary: classes.primaryText }}
                                />
                                <Typography className={classes.primaryText}>+{data.dialing_code}</Typography>
                            </ListItemButton>
                        )
                    })}
                </List>
            :   <EmptyStatus style={{ height: 246 }}>
                    <Trans>No results</Trans>
                </EmptyStatus>
            }
        </Popover>
    )
})
