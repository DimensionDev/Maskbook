import { Slider } from '@material-ui/core'
import { formatPercentage } from '@masknet/web3-shared'
import { SLIPPAGE_TOLERANCE_DEFAULT, SLIPPAGE_TOLERANCE_MAX, SLIPPAGE_TOLERANCE_MIN } from '../../constants'
import { toBips } from '../../helpers'

export interface SlippageSliderProps {
    value: number
    onChange(value: number): void
}

export function SlippageSlider(props: SlippageSliderProps) {
    const { value = SLIPPAGE_TOLERANCE_DEFAULT, onChange } = props
    return (
        <Slider
            value={value}
            getAriaValueText={(v) => formatPercentage(toBips(v))}
            step={10}
            min={SLIPPAGE_TOLERANCE_MIN}
            max={SLIPPAGE_TOLERANCE_MAX}
            onChange={(_, value: number | number[]) => onChange(value as number)}
        />
    )
}
