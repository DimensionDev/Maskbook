import { languageSettings } from '../../../settings/settings'

const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
}

export const dateTimeFormat = (date: Date | string | number) => {
    const formatter = new Intl.DateTimeFormat(languageSettings.value, formatOptions)
    return formatter.format(new Date(date))
}
