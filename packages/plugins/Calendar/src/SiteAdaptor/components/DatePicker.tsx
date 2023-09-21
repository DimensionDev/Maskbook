import React, { useMemo } from 'react'
import format from 'date-fns/format'
import startOfMonth from 'date-fns/startOfMonth'
import addDays from 'date-fns/addDays'
import addMonths from 'date-fns/addMonths'
import isAfter from 'date-fns/isAfter'
import endOfMonth from 'date-fns/endOfMonth'
import { IconButton, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/system'

const useStyles = makeStyles<{ open: boolean }>()((theme, { open }) => ({
    container: {
        background: theme.palette.mode === 'dark' ? '#18232E' : theme.palette.maskColor.white,
        boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)',
        borderRadius: '16px',
        display: open ? 'flex' : 'none',
        flexDirection: 'column',
        gap: '24px',
        width: '320px',
        height: '355px',
        padding: '24px',
        position: 'absolute',
        left: '-16px',
        zIndex: 999,
    },
    daysOfWeek: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.third,
        marginBottom: '24px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        color: theme.palette.maskColor.main,
        fontSize: '24px',
        fontWeight: 700,
        lineHeight: '120%',
    },
    headerIcon: {
        display: 'flex',
        alignItems: 'center',
    },
    dateItem: {
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: '20px',
        color: theme.palette.maskColor.third,
        width: '38px',
        height: '38px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
    },
    row: {
        marginBottom: '8px',
    },
    canClick: {
        color: theme.palette.maskColor.main,
        cursor: 'pointer',
    },
    active: {
        color: theme.palette.maskColor.white,
        background: theme.palette.maskColor.primary,
    },
    button: {
        outline: 'none',
        background: 'none',
        border: 'none',
        padding: 0,
    },
}))

interface DatePickerProps {
    open: boolean
    setOpen: (x: boolean) => void
    selectedDate: Date
    setSelectedDate: (date: Date) => void
    list: Record<string, any[]> | null
}

export function DatePicker({ list, selectedDate, setSelectedDate, open, setOpen }: DatePickerProps) {
    const { classes } = useStyles({ open })

    const monthStart = useMemo(() => startOfMonth(selectedDate), [selectedDate])
    const isPrevMonthDisabled = useMemo(() => {
        return !isAfter(selectedDate, endOfMonth(new Date()))
    }, [selectedDate])
    const isNextMonthDisabled = useMemo(() => {
        return isAfter(addMonths(selectedDate, 1), addMonths(endOfMonth(new Date()), 2))
    }, [selectedDate])

    const handleDateClick = (date: Date) => {
        setSelectedDate(date)
        setOpen(false)
    }

    const changeMonth = (amount: number) => {
        setSelectedDate(addMonths(selectedDate, amount))
    }

    const renderDatePicker = () => {
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        const table = (
            <table>
                <thead>
                    <tr className={classes.daysOfWeek}>
                        {daysOfWeek.map((day) => (
                            <th key={day}>
                                <Typography>{day}</Typography>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 6 }).map((_, weekIndex) => (
                        <tr key={weekIndex} className={classes.row}>
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const currentDatePointer = addDays(monthStart, weekIndex * 7 + dayIndex)
                                return (
                                    <td key={dayIndex}>
                                        <button
                                            className={classes.button}
                                            type="submit"
                                            disabled={!list?.[currentDatePointer.toLocaleDateString()]}
                                            onClick={() => handleDateClick(currentDatePointer)}>
                                            <Typography
                                                className={`${classes.dateItem} ${
                                                    selectedDate.toDateString() === currentDatePointer.toDateString()
                                                        ? classes.active
                                                        : list?.[currentDatePointer.toLocaleDateString()]
                                                        ? classes.canClick
                                                        : ''
                                                }`}>
                                                {format(currentDatePointer, 'd')}
                                            </Typography>
                                        </button>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        )

        return (
            <div className={classes.container}>
                <div className={classes.header}>
                    <Typography className={classes.headerText}>{format(selectedDate, 'MMMM yyyy')}</Typography>
                    <Box className={classes.headerIcon}>
                        <IconButton size="small" onClick={() => changeMonth(-1)} disabled={isPrevMonthDisabled}>
                            <Icons.LeftArrow size={24} />
                        </IconButton>
                        <IconButton size="small" onClick={() => changeMonth(1)} disabled={isNextMonthDisabled}>
                            <Icons.RightArrow size={24} />
                        </IconButton>
                    </Box>
                </div>
                {table}
            </div>
        )
    }

    return <div>{renderDatePicker()}</div>
}

export default DatePicker
