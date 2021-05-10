import { languageSettings } from '../../../settings/settings'

export const dateTimeFormat = (date: Date) =>
    new Intl.DateTimeFormat(languageSettings.value, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    }).format(date)
