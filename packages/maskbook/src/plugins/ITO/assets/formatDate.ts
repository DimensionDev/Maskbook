import { languageSettings } from '../../../settings/settings'

export const dateTimeFormat = (date: Date, includeTime = true) =>
    new Intl.DateTimeFormat(languageSettings.value, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        ...(includeTime && { hour: 'numeric', minute: 'numeric' }),
        hour12: false,
    }).format(date)
