import { MaskColorVar } from '@masknet/theme'
import { formControlLabelClasses } from '@mui/material'
import {
    FormControl,
    FormControlLabel,
    FormControlLabelProps,
    FormLabel,
    Radio,
    RadioGroup,
    useRadioGroup,
    styled,
} from '@mui/material'

interface option {
    label: string
    value: any
}

export interface SettingItemProps {
    legend: string
    value: any
    options: option[]
    onChange?: (value: string) => void
}

interface StyledFormControlLabelProps extends FormControlLabelProps {
    checked: boolean
}

const StyledFormControlLabel = styled((props: StyledFormControlLabelProps) => <FormControlLabel {...props} />)(
    ({ checked }) => ({
        [`& .${formControlLabelClasses.label}`]: {
            color: checked ? MaskColorVar.textPrimary : MaskColorVar.textSecondary,
        },
    }),
)

function MyFormControlLabel(props: FormControlLabelProps) {
    const radioGroup = useRadioGroup()

    let checked = false

    if (radioGroup) {
        checked = radioGroup.value === props.value
    }

    return <StyledFormControlLabel checked={checked} {...props} />
}

export default function SettingItem({ legend, options, value, onChange }: SettingItemProps) {
    return (
        <FormControl component="fieldset" sx={{ paddingBottom: '8px' }}>
            <FormLabel
                component="legend"
                sx={{ paddingBottom: '8px', color: MaskColorVar.textPrimary, fontWeight: '500' }}>
                {legend}
            </FormLabel>
            <RadioGroup
                aria-label="gender"
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                name="radio-buttons-group">
                {options.map((opt) => (
                    <MyFormControlLabel
                        value={opt.value}
                        control={<Radio size="small" />}
                        label={opt.label}
                        key={opt.value}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    )
}
