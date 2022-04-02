import { i18NextInstance } from '@masknet/shared-base'

export const dateTimeFormat = (date: Date, includeTime = true) =>
    new Intl.DateTimeFormat(i18NextInstance.language, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        ...(includeTime && { hour: 'numeric', minute: 'numeric' }),
        hour12: false,
    }).format(date)
