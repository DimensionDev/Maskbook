import React, { useMemo } from 'react'
import { makeStyles, useTabs } from '@masknet/theme'
import startOfWeek from 'date-fns/startOfWeek'
import endOfWeek from 'date-fns/endOfWeek'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'
import { ClickAwayListener, IconButton, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { DatePicker } from './DatePicker.js'

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
        cursor: 'default',
    },
}))

interface DatePickerTabProps {
    open: boolean
    setOpen: (x: boolean) => void
    selectedDate: Date
    setSelectedDate: (date: Date) => void
    list: Record<string, any[]> | null
}

export function DatePickerTab({ selectedDate, setSelectedDate, list, open, setOpen }: DatePickerTabProps) {
    const { classes } = useStyles()
    const week = useMemo(() => {
        return eachDayOfInterval({ start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) })
    }, [selectedDate])
    const [currentTab, onChange, tabs] = useTabs(
        ...(week.map((v) => v.getDate().toString()) as unknown as [string, string]),
    )
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
                        <Typography>{v.getDate()}</Typography>
                    </div>
                )
            })}
            <ClickAwayListener onClickAway={() => setOpen(false)}>
                <div>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setOpen(!open)
                        }}>
                        <Icons.LinearCalendar size={24} />
                    </IconButton>
                    <DatePicker
                        open={open}
                        setOpen={(open) => setOpen(open)}
                        list={list}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                    />
                </div>
            </ClickAwayListener>
        </div>
    )
}
