//TODO: replace to new settings util
import { createInternalSettings } from '../../../../maskbook/src/settings/createSettings'

export const currentPersonaIdentifier = createInternalSettings<string>('currentPersonaIdentifier', '')
