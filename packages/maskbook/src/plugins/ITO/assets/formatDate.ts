import i18nNextInstance from '../../../utils/i18n-next'

export const dateTimeFormat = (date: Date, includeTime = true) =>
    new Intl.DateTimeFormat(i18nNextInstance.language, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        ...(includeTime && { hour: 'numeric', minute: 'numeric' }),
        hour12: false,
    }).format(date)
