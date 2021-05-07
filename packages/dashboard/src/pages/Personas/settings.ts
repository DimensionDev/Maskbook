// TODO: Replace to new settings utils
import { createInternalSettings } from '../../../../maskbook/src/settings/createSettings'

export const currentPersonaSettings = createInternalSettings<string>('currentPersona', '{}')
