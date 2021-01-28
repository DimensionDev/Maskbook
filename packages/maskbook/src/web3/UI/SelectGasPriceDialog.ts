import { useGasPrice } from '../hooks/useGasPrice'

export interface SelectGasPriceDialogProps {}

export function SelectGasPriceDialog(props: SelectGasPriceDialogProps) {
    const gasPrice = useGasPrice()
    return null
}
