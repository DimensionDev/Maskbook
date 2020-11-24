import { Slider } from '@material-ui/core'
import { formatPercentage } from '../../../Wallet/formatter'
import { DEFAULT_SLIPPAGE_TOLERANCE, MIN_SLIPPAGE_TOLERANCE, MAX_SLIPPAGE_TOLERANCE } from '../../constants'
import { toBips } from '../../helpers'

export interface SlippageSliderProps {
    value: number
    onChange(value: number): void
}

export function SlippageSlider(props: SlippageSliderProps) {
    const { value = DEFAULT_SLIPPAGE_TOLERANCE, onChange } = props
    return (
        <Slider
            value={value}
            getAriaValueText={(v) => formatPercentage(toBips(v))}
            step={10}
            min={MIN_SLIPPAGE_TOLERANCE}
            max={MAX_SLIPPAGE_TOLERANCE}
            onChange={(_, value: number | number[]) => onChange(value as number)}
        />
    )
}
