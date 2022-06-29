import type { PersonaInformation } from '@masknet/shared-base'

export let initialPersonaInformation: PersonaInformation[] | undefined = undefined
export function setInitialPersonaInformation(data: PersonaInformation[]) {
    initialPersonaInformation = data
}
