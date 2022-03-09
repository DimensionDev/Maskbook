import { useMatch } from 'react-router-dom'

export function useIsMatched(...args: Parameters<typeof useMatch>) {
    const match = useMatch(...args)
    return match !== null
}
