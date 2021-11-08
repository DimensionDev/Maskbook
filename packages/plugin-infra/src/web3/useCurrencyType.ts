import { useWeb3StateContext } from '.'

export function useCurrencyType() {
    return useWeb3StateContext().currencyType
}
