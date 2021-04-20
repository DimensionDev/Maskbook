import { makeStyles, TextField, TextFieldProps } from '@material-ui/core'
import formatDateTime from 'date-fns/format'

export interface DateTimePanelProps {
    label: string
    date: Date
    onChange: (date: Date) => void
    TextFieldProps?: Partial<TextFieldProps>
}

const useStyles = makeStyles((theme) => ({
    datetime: {
        '&::-webkit-calendar-picker-indicator': {
            marginLeft: 0,
            backgroundImage: `url(${new URL('./calendar.png', import.meta.url)})`,
        },
    },
}))

export function DateTimePanel(props: DateTimePanelProps) {
    const { label, date, onChange, TextFieldProps } = props
    const GMT = (new Date().getTimezoneOffset() / 60) * -1
    const classes = useStyles()

    return (
        <TextField
            label={`${label} ${GMT >= 0 ? `(UTC +${GMT})` : `(UTC ${GMT})`}`}
            type="datetime-local"
            value={formatDateTime(date, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => {
                const date = new Date(e.currentTarget.value)
                onChange(date)
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ className: classes.datetime }}
            {...TextFieldProps}
        />
    )
}
