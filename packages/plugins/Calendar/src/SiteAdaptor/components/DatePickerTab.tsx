import React, { useMemo, useState, useRef } from 'react'
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
}

export function DatePickerTab({ selectedDate, setSelectedDate }: DatePickerTabProps) {
    const [open, setOpen] = useState(false)
    const iconRef = useRef<HTMLDivElement>(null)
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
                        className={`${classes.date} ${selectedDate.getDate() === v.getDate() ? classes.isActive : ''}`}
                        key={v.toString()}
                        onClick={() => {
                            setSelectedDate(v)
                        }}>
                        {' '}
                        {v.getDate()}{' '}
                    </div>
                )
            })}
            <IconButton size="small" onClick={() => setOpen(!open)}>
                <div ref={iconRef}>
                    <Icons.LinearCalendar />
                </div>
            </IconButton>
            <Popover id={id} open={open} anchorEl={iconRef.current} onClose={() => setOpen(false)}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateCalendar />
                </LocalizationProvider>
            </Popover>
        </div>
    )
}
