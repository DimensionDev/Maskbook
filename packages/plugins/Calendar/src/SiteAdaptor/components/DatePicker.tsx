import React, { useMemo, useState } from 'react'
import { format, startOfMonth, addDays, addMonths, isAfter, endOfMonth } from 'date-fns'
import { IconButton, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { useEventList, useNFTList, useNewsList } from '../../hooks/useEventList.js'
import { safeUnreachable } from '@masknet/kit'
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
    currentTab: 'news' | 'event' | 'nfts'
}

export function DatePicker({ selectedDate, setSelectedDate, open, setOpen, currentTab }: DatePickerProps) {
    const { classes } = useStyles({ open })
    const [currentDate, setCurrentDate] = useState(selectedDate)
    const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate])
    const { data: eventList } = useEventList(monthStart)
    const { data: newsList } = useNewsList(monthStart)
    const { data: nftList } = useNFTList(monthStart)
    const list = useMemo(() => {
        switch (currentTab) {
            case 'news':
                return newsList
            case 'event':
                return eventList
            case 'nfts':
                return nftList
            default:
                safeUnreachable(currentTab)
                return null
        }
    }, [currentTab, newsList, eventList, nftList])

    const isPrevMonthDisabled = useMemo(() => {
        return !isAfter(currentDate, endOfMonth(new Date()))
    }, [currentDate])
    const isNextMonthDisabled = useMemo(() => {
        return isAfter(addMonths(currentDate, 1), addMonths(endOfMonth(new Date()), 2))
    }, [currentDate])

    const handleDateClick = (date: Date) => {
        setSelectedDate(date)
        setOpen(false)
    }

    const changeMonth = (amount: number) => {
        setCurrentDate(addMonths(currentDate, amount))
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
                                                    selectedDate.toDateString() === currentDatePointer.toDateString() ?
                                                        classes.active
                                                    : list?.[currentDatePointer.toLocaleDateString()] ? classes.canClick
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
                    <Typography className={classes.headerText}>{format(currentDate, 'MMMM yyyy')}</Typography>
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
