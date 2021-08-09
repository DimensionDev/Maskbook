import { Slider } from '@material-ui/core'
import { formatPercentage } from '@masknet/web3-shared'
import { SLIPPAGE_SETTINGS_DEFAULT, SLIPPAGE_SETTINGS_MAX, SLIPPAGE_SETTINGS_MIN } from '../../constants'
import { toBips } from '../../helpers'

export interface SlippageSliderProps {
    value: number
    onChange(value: number): void
}

export function SlippageSlider(props: SlippageSliderProps) {
    const { value = SLIPPAGE_SETTINGS_DEFAULT, onChange } = props
    return (
        <Slider
            value={value}
            getAriaValueText={(v) => formatPercentage(toBips(v))}
            step={10}
            min={SLIPPAGE_SETTINGS_MIN}
            max={SLIPPAGE_SETTINGS_MAX}
            onChange={(_, value: number | number[]) => onChange(value as number)}
        />
    )
}
