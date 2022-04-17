import { MAX_PERSONA_NAME_LENGTH } from '@masknet/shared-base'

export const formatPersonaName = (nickname?: string) => {
    if (!nickname) return ''
    if (nickname.length < MAX_PERSONA_NAME_LENGTH) return nickname

    return `${nickname.substring(0, 12)}...`
}
