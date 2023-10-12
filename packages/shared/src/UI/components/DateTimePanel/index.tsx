import { type TextFieldProps, InputBase, Typography, inputBaseClasses } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { format as formatDateTime } from 'date-fns'

export interface DateTimePanelProps extends Omit<TextFieldProps, 'onChange'> {
    date: Date
    onChange: (date: Date) => void
    min?: string
    max?: string
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        height: 66,
        padding: theme.spacing(1.25, 1.5),
        [`&.${inputBaseClasses.focused} > .${inputBaseClasses.input}`]: {
            padding: theme.spacing(2.75, 0, 0, 0),
            flex: 2,
        },
        [`& > .${inputBaseClasses.input}`]: {
            padding: theme.spacing(2.75, 0, 0, 0),
            flex: 2,
        },
    },
    datetime: {
        '&::-webkit-calendar-picker-indicator': {
            marginLeft: 0,
            backgroundImage: `url(${new URL('./calendar.png', import.meta.url)})`,
        },
    },
    inputLabel: {
        position: 'absolute',
        left: 8,
        top: 8,
        fontSize: 13,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
        whiteSpace: 'nowrap',
    },
}))

export function DateTimePanel(props: DateTimePanelProps) {
    const { label, date, onChange, min, max, inputProps, ...rest } = props
    const GMT = (new Date().getTimezoneOffset() / 60) * -1
    const { classes, cx } = useStyles()

    return (
        <InputBase
            value={formatDateTime(date, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => {
                const date = new Date(e.currentTarget.value)
                onChange(date)
            }}
            startAdornment={
                <Typography className={classes.inputLabel}>{`${label} ${
                    GMT >= 0 ? `(UTC +${GMT})` : `(UTC ${GMT})`
                }`}</Typography>
            }
            inputProps={{ className: classes.datetime, ...inputProps, min, max }}
            type="datetime-local"
            className={cx(classes.root, rest.className)}
        />
    )
}
