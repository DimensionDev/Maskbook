import { i18NextInstance } from '@masknet/shared-base'

export function dateTimeFormat(date: Date, includeTime = true) {
    return new Intl.DateTimeFormat(
        i18NextInstance.language,
        includeTime
            ? {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hourCycle: 'h23',
              }
            : {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
              },
    ).format(date)
}
