import React, { useMemo } from 'react'
import { makeStyles, useTabs } from '@masknet/theme'
import startOfWeek from 'date-fns/startOfWeek'
import endOfWeek from 'date-fns/endOfWeek'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'
import { Icons } from '@masknet/icons'
import { IconButton, Popover } from '@mui/material'
import { LocalizationProvider } from '@mui/lab'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        padding: '12px',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    date: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: theme.palette.maskColor.main,
        fontSize: 16,
        fontFamily: 'Helvetica',
        fontWeight: '400',
        lineHeight: 20,
        borderRadius: 999,
        textAlign: 'center',
        width: '28px !important',
        height: '28px !important',
        border: `0.5px ${theme.palette.maskColor.line} solid`,
        cursor: 'pointer',
    },
    isActive: {
        border: `0.5px ${theme.palette.maskColor.main} solid`,
    },
    disabled: {
        color: theme.palette.maskColor.second,
    },
}))

interface DatePickerTabProps {
    selectedDate: Date
    setSelectedDate: (date: Date) => void
    list: Record<string, any[]> | null
}

export function DatePickerTab({ selectedDate, setSelectedDate, list }: DatePickerTabProps) {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log(event)
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }
    const open = Boolean(anchorEl)
    const { classes } = useStyles()
    const week = useMemo(() => {
        return eachDayOfInterval({ start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) })
    }, [selectedDate])
    const [currentTab, onChange, tabs] = useTabs(
        ...(week.map((v) => v.getDate().toString()) as unknown as [string, string]),
    )
    const id = open ? 'simple-popover' : undefined
    return (
        <div className={classes.container}>
            {week.map((v) => {
                return (
                    <div
                        className={`${classes.date} ${selectedDate.getDate() === v.getDate() ? classes.isActive : ''} ${
                            list && !list[v.toLocaleDateString()] ? classes.disabled : ''
                        }`}
                        key={v.toString()}
                        onClick={() => {
                            if (list && !list[v.toLocaleDateString()]) return
                            setSelectedDate(v)
                        }}>
                        {' '}
                        {v.getDate()}{' '}
                    </div>
                )
            })}
            <IconButton size="small" onClick={handleClick} aria-describedby={id}>
                <Icons.LinearCalendar />
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}>
                <div style={{ padding: '16px' }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateCalendar />
                    </LocalizationProvider>
                </div>
            </Popover>
        </div>
    )
}
