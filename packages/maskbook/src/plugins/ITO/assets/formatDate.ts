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

export function datetimeISOString(value: Date): string {
    if (value && value instanceof Date && !isNaN(value.valueOf())) {
        const pad = (value: number) => value.toString(10).padStart(2, '0')
        const date = [value.getFullYear(), value.getMonth() + 1, value.getDate()]
        const time = [value.getHours(), value.getMinutes(), value.getSeconds()]
        return `${date.map(pad).join('-')}T${time.map(pad).join(':')}`
    }
    return ''
}
