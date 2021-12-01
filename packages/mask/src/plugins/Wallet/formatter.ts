import { i18n } from '../../../shared-ui/locales_legacy'

export function formatElapsed(from: number) {
    const msPerMinute = 60 * 1000
    const msPerHour = msPerMinute * 60
    const msPerDay = msPerHour * 24
    const msPerMonth = msPerDay * 30
    const msPerYear = msPerDay * 365
    const elapsed = Date.now() - from
    if (elapsed < msPerMinute)
        return i18n.t('relative_time_seconds_ago', {
            seconds: Math.round(elapsed / 1000),
        })
    if (elapsed < msPerHour)
        return i18n.t('relative_time_minutes_ago', {
            minutes: Math.round(elapsed / msPerMinute),
        })
    if (elapsed < msPerDay)
        return i18n.t('relative_time_hours_ago', {
            hours: Math.round(elapsed / msPerHour),
        })
    if (elapsed < msPerMonth)
        return i18n.t('relative_time_days_ago', {
            days: Math.round(elapsed / msPerDay),
        })
    if (elapsed < msPerYear)
        return i18n.t('relative_time_months_ago', {
            months: Math.round(elapsed / msPerMonth),
        })
    return i18n.t('relative_time_years_ago', {
        years: Math.round(elapsed / msPerYear),
    })
}
