import { languageSettings } from '../../../settings/settings'

const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
}

/**
 * @deprecated please use `date-fns/format` replace this function.
 * @see https://date-fns.org/v2.22.1/docs/format
 */
export const dateTimeFormat = (date: Date | string | number) => {
    const formatter = new Intl.DateTimeFormat(languageSettings.value, formatOptions)
    return formatter.format(new Date(date))
}
