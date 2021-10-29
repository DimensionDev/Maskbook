import { TextField, TextFieldProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import formatDateTime from 'date-fns/format'

export interface DateTimePanelProps extends Omit<TextFieldProps, 'onChange'> {
    date: Date
    onChange: (date: Date) => void
    min?: string
    max?: string
}

const useStyles = makeStyles()({
    datetime: {
        '&::-webkit-calendar-picker-indicator': {
            marginLeft: 0,
            backgroundImage: `url(${new URL('./calendar.png', import.meta.url)})`,
        },
    },
    inputLabel: {
        left: 8,
        top: 8,
    },
})

export function DateTimePanel(props: DateTimePanelProps) {
    const { label, date, onChange, min, max, inputProps, ...rest } = props
    const GMT = (new Date().getTimezoneOffset() / 60) * -1
    const { classes } = useStyles()
    return (
        <TextField
            {...rest}
            label={`${label} ${GMT >= 0 ? `(UTC +${GMT})` : `(UTC ${GMT})`}`}
            value={formatDateTime(date, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => {
                const date = new Date(e.currentTarget.value)
                onChange(date)
            }}
            InputLabelProps={{
                shrink: true,
                classes: {
                    root: classes.inputLabel,
                },
            }}
            inputProps={{ className: classes.datetime, ...inputProps, min, max }}
            type="datetime-local"
        />
    )
}
