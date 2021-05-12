import { createInternalSettings } from '../../../../maskbook/src/settings/createSettings'

export const currentPersonaIdentifier = createInternalSettings<string>('currentPersonaIdentifier', '')
