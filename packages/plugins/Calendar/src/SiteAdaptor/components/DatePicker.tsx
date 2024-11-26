import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { IconButton, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns'
import { range } from 'lodash-es'
import { useState } from 'react'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        container: {
            background: theme.palette.maskColor.bottom,
            boxShadow: isDark ? '0px 4px 30px 0px rgba(255, 255, 255, 0.1)' : '0px 4px 30px 0px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            display: 'flex',
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
    }
})

export interface DatePickerProps {
    open: boolean
    onToggle: (x: boolean) => void
    date: Date
    /** locale date string list */
    allowedDates: string[]
    onChange: (date: Date) => void
    onMonthChange: (date: Date) => void
}

export function DatePicker({ date, onChange, open, onToggle, allowedDates, onMonthChange }: DatePickerProps) {
    const { classes } = useStyles()
    const [currentDate, setCurrentDate] = useState(date)
    const monthStart = startOfMonth(currentDate)
    const startingDayOfWeek = monthStart.getDay()
    const daysInMonth = endOfMonth(currentDate).getDate()
    const daysInPrevMonth = endOfMonth(addMonths(currentDate, -1)).getDate()

    if (!open) return null

    const handleDateClick = (date: Date) => {
        onChange(date)
        onToggle(false)
    }

    const changeMonth = (amount: number) => {
        const date = addMonths(currentDate, amount)
        setCurrentDate(date)
        onMonthChange(date)
    }

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
                {range(6).map((weekIndex) => (
                    <tr key={weekIndex} className={classes.row}>
                        {range(7).map((dayIndex) => {
                            const dayOfMonth = weekIndex * 7 + dayIndex - startingDayOfWeek + 1
                            let currentDatePointer = new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                dayOfMonth,
                            )

                            if (dayOfMonth <= 0) {
                                currentDatePointer = new Date(
                                    currentDate.getFullYear(),
                                    currentDate.getMonth() - 1,
                                    daysInPrevMonth + dayOfMonth,
                                )
                            } else if (dayOfMonth > daysInMonth) {
                                currentDatePointer = new Date(
                                    currentDate.getFullYear(),
                                    currentDate.getMonth() + 1,
                                    dayOfMonth - daysInMonth,
                                )
                            }
                            const localeDateString = format(currentDatePointer, 'MM/dd/yyyy')

                            return (
                                <td key={dayIndex}>
                                    <button
                                        className={classes.button}
                                        type="submit"
                                        disabled={!allowedDates.includes(localeDateString)}
                                        onClick={() => handleDateClick(currentDatePointer)}>
                                        <Typography
                                            className={`${classes.dateItem} ${
                                                date.toDateString() === currentDatePointer.toDateString() ?
                                                    classes.active
                                                : allowedDates.includes(localeDateString) ? classes.canClick
                                                : ''
                                            }`}>
                                            {currentDatePointer.getDate()}
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
                <Typography className={classes.headerText}>{format(currentDate, 'MMMM yyyy')}</Typography>
                <Box className={classes.headerIcon}>
                    <IconButton size="small" onClick={() => changeMonth(-1)}>
                        <Icons.LeftArrow size={24} />
                    </IconButton>
                    <IconButton size="small" onClick={() => changeMonth(1)}>
                        <Icons.RightArrow size={24} />
                    </IconButton>
                </Box>
            </div>
            {table}
        </div>
    )
}
