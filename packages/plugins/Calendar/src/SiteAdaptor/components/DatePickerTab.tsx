import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { ClickAwayListener, IconButton, Typography } from '@mui/material'
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from 'date-fns'
import { useMemo } from 'react'
import { DatePicker, type DatePickerProps } from './DatePicker.js'

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
        fontWeight: '700',
    },
    disabled: {
        color: theme.palette.maskColor.second,
        cursor: 'default',
    },
}))

interface DatePickerTabProps extends DatePickerProps {}

export function DatePickerTab(props: DatePickerTabProps) {
    const { open, date, allowedDates, onChange, onToggle } = props
    const { classes } = useStyles()

    const days = useMemo(() => {
        return eachDayOfInterval({ start: startOfWeek(date), end: endOfWeek(date) })
    }, [date])

    return (
        <div className={classes.container}>
            {days.map((v) => {
                const localeDateString = format(v, 'MM/dd/yyyy')
                return (
                    <div
                        className={`${classes.date} ${date.getDate() === v.getDate() ? classes.isActive : ''} ${
                            allowedDates.includes(localeDateString) ? '' : classes.disabled
                        }`}
                        key={v.toString()}
                        onClick={() => {
                            if (!allowedDates.includes(localeDateString)) return
                            onChange(v)
                        }}>
                        <Typography>{v.getDate()}</Typography>
                    </div>
                )
            })}
            <ClickAwayListener onClickAway={() => onToggle(false)}>
                <div>
                    <IconButton
                        size="small"
                        onClick={() => {
                            onToggle(!open)
                        }}>
                        <Icons.LinearCalendar size={24} />
                    </IconButton>
                    <DatePicker {...props} />
                </div>
            </ClickAwayListener>
        </div>
    )
}
