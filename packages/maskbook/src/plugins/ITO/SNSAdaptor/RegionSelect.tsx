import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import type { InputBaseComponentProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useDebounce } from 'react-use'
import {
    Typography,
    Popover,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    FormControl,
    InputAdornment,
    FilledInput,
} from '@mui/material'

import { Flags, useI18N, usePortalShadowRoot } from '../../../utils'
import { useRegionList } from './hooks/useRegion'
import type { RegionCode } from './hooks/useRegion'

export interface RegionSelectProps extends InputBaseComponentProps {
    value: RegionCode[]
    // onChange: React.ChangeEvent<{ value: RegionCode[] }> // TODO how to implement the ChangeEvent interface?
    onRegionChange: (codes: RegionCode[]) => void
}

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        width: '100%',
        height: '54px',
        alignItems: 'center',
        paddingLeft: theme.spacing(2),
    },
    allToggle: {
        marginLeft: `-${theme.spacing(1)}`,
    },
    inputControl: {
        display: 'flex',
    },
    inputRoot: {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        '&:before': {
            borderColor: 'rgba(0, 0, 0, 0.01)',
        },
    },
    input: {
        padding: `${theme.spacing(2)}`,
    },
    span: {
        paddingLeft: theme.spacing(2),
    },
    options: {
        maxHeight: 140,
        overflow: 'auto',
    },
    display: {
        padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
    },
    item: {
        padding: `0 ${theme.spacing(2)}`,
    },
}))

// TODO fix TextField focus style
export const RegionSelect = forwardRef(({ value = [], onRegionChange, ...props }: RegionSelectProps, ref) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const allRegions = useRegionList()
    const isAll = value.length === allRegions.length
    const valueMap = new Map(value.map((code) => [code, true]))

    const displayRef = useRef<HTMLElement | null>()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [open, setOpen] = useState(false)
    const handleDisplayRef = useCallback((node) => {
        displayRef.current = node
        if (node) setAnchorEl(node)
    }, [])
    const [minPopoverWidth, setMinPopoverWidth] = useState(0)

    useImperativeHandle(ref, () => ({
        focus: () => {
            displayRef.current?.focus()
        },
    }))

    const [filterText, setFilterText] = useState('')
    const [filteredRegions, setFilteredRegions] = useState(allRegions)

    const [, cancelFilterDebounce] = useDebounce(
        () => {
            const reg = new RegExp(filterText, 'i')
            setFilteredRegions(allRegions.filter((region) => reg.test(region.name) || reg.test(region.code)))
        },
        500,
        [filterText],
    )

    const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterText(event.target.value)
    }

    const isAllFiltered = filteredRegions.every((region) => valueMap.get(region.code))

    const handleToggleAllFiltered = () => {
        filteredRegions.forEach((r) => {
            isAllFiltered ? valueMap.delete(r.code) : valueMap.set(r.code, true)
        })
        onRegionChange(Array.from(valueMap.keys()))
    }

    const handleOpenChange = (toOpen: boolean, event: React.SyntheticEvent) => {
        if (toOpen && anchorEl) setMinPopoverWidth(anchorEl.clientWidth)
        if (!toOpen) {
            setFilterText('')
            cancelFilterDebounce()
        }
        setOpen(toOpen)
    }

    const handleToggle = (code: RegionCode) => () => {
        const isSelected = valueMap.get(code)
        isSelected ? valueMap.delete(code) : valueMap.set(code, true)
        onRegionChange(Array.from(valueMap.keys()))
    }

    const handleMouseDown = (event: React.MouseEvent) => {
        // Ignore everything but left-click
        if (event.button !== 0) {
            return
        }
        // Hijack the default focus behavior.
        event.preventDefault()
        handleOpenChange(true, event)
    }

    const handlePopoverClose = (event: React.SyntheticEvent) => {
        handleOpenChange(false, event)
    }

    return (
        <>
            <Typography className={classes.root} ref={handleDisplayRef} onMouseDown={handleMouseDown}>
                {isAll
                    ? t('plugin_ito_region_all')
                    : t('plugin_ito_region_list', { all: allRegions.length, select: value.length })}
            </Typography>
            {usePortalShadowRoot((container) => (
                <Popover
                    container={container}
                    open={open}
                    anchorEl={anchorEl}
                    PaperProps={{
                        style: { minWidth: `${minPopoverWidth}px` },
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={handlePopoverClose}
                    disableRestoreFocus>
                    <FormControl className={classes.inputControl} variant="filled">
                        <FilledInput
                            className={classes.inputRoot}
                            placeholder={t('plugin_ito_region_search')}
                            onChange={handleFilter}
                            inputProps={{
                                className: classes.input,
                            }}
                            startAdornment={
                                <Checkbox
                                    color="primary"
                                    className={classes.allToggle}
                                    checked={isAllFiltered}
                                    onChange={handleToggleAllFiltered}
                                    disableRipple
                                />
                            }
                            endAdornment={
                                <InputAdornment position="end">
                                    {value.length}/{allRegions.length}
                                </InputAdornment>
                            }
                        />
                    </FormControl>
                    <List className={classes.options}>
                        {/* TODO  resolve options performance problem */}
                        {filteredRegions.map((region) => {
                            return (
                                <ListItem
                                    key={region.code}
                                    className={classes.item}
                                    onClick={handleToggle(region.code)}>
                                    <Checkbox
                                        edge="start"
                                        color="primary"
                                        checked={valueMap.has(region.code)}
                                        disableRipple
                                    />
                                    <ListItemText>
                                        <span>{countryToFlag(region.code)}</span>
                                        <span className={classes.span}>{region.name}</span>
                                    </ListItemText>
                                </ListItem>
                            )
                        })}
                    </List>
                </Popover>
            ))}
        </>
    )
})

// ISO 3166-1 alpha-2
function countryToFlag(isoCode: string) {
    if (!Flags.using_emoji_flag) {
        return ''
    }
    return isoCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
}
