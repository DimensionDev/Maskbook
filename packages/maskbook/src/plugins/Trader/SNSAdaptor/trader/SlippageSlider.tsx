import { Slider } from '@material-ui/core'
import { formatPercentage } from '@masknet/web3-shared-evm'
import { SLIPPAGE_DEFAULT, SLIPPAGE_MAX, SLIPPAGE_MIN } from '../../constants'
import { toBips } from '../../helpers'

export interface SlippageSliderProps {
    value: number
    onChange(value: number): void
}

export function SlippageSlider(props: SlippageSliderProps) {
    const { value = SLIPPAGE_DEFAULT, onChange } = props
    return (
        <Slider
            value={value}
            getAriaValueText={(v) => formatPercentage(toBips(v))}
            step={10}
            min={SLIPPAGE_MIN}
            max={SLIPPAGE_MAX}
            onChange={(_, value: number | number[]) => onChange(value as number)}
        />
    )
}
