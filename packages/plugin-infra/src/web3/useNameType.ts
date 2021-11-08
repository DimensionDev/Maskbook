import { useWeb3StateContext } from '.'

export function useNameType() {
    return useWeb3StateContext().nameType
}
