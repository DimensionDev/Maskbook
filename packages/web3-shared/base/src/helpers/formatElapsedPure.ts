import { i18NextInstance } from '@masknet/shared-base'

export function formatElapsedPure(from: number, started: boolean) {
    const msPerMinute = 60 * 1000
    const msPerHour = msPerMinute * 60
    const msPerDay = msPerHour * 24
    const msPerMonth = msPerDay * 30
    const msPerYear = msPerDay * 365
    const elapsed = started ? Date.now() - from : from - Date.now()
    if (elapsed < msPerMinute)
        return i18NextInstance.t('relative_time_seconds', {
            seconds: Math.round(elapsed / 1000),
        })
    if (elapsed < msPerHour)
        return i18NextInstance.t('relative_time_minutes', {
            minutes: Math.round(elapsed / msPerMinute),
        })
    if (elapsed < msPerDay)
        return i18NextInstance.t('relative_time_hours', {
            hours: Math.round(elapsed / msPerHour),
        })
    if (elapsed < msPerMonth)
        return i18NextInstance.t('relative_time_days', {
            days: Math.round(elapsed / msPerDay),
        })
    if (elapsed < msPerYear)
        return i18NextInstance.t('relative_time_months', {
            months: Math.round(elapsed / msPerMonth),
        })
    return i18NextInstance.t('relative_time_years', {
        years: Math.round(elapsed / msPerYear),
    })
}
