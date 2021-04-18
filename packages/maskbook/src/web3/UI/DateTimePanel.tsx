import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { TextField, TextFieldProps } from '@material-ui/core'
import { usePortalShadowRoot } from '@dimensiondev/maskbook-shared'
import { LocalizationProvider, MobileDateTimePicker } from '@material-ui/lab'

export interface DateTimePanelProps {
    label: string
    date: Date
    onChange: (date: Date) => void
    TextFieldProps?: Partial<TextFieldProps>
}

export function DateTimePanel(props: DateTimePanelProps) {
    const { label, date, onChange, TextFieldProps } = props
    const GMT = (new Date().getTimezoneOffset() / 60) * -1
    return usePortalShadowRoot((container) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDateTimePicker
                showTodayButton
                ampm={false}
                label={`${label} ${GMT >= 0 ? `(UTC +${GMT})` : `(UTC ${GMT})`}`}
                onChange={(date: Date | null) => {
                    if (!date) return
                    onChange(date)
                }}
                renderInput={(props) => <TextField fullWidth {...props} {...TextFieldProps} />}
                value={date}
                DialogProps={{ container }}
            />
        </LocalizationProvider>
    ))
}
