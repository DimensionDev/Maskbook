import { context } from '../context'

export function usePersonaSign() {
    return context.generateSign
}
