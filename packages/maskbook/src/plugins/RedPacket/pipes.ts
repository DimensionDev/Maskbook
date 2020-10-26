import { i18n } from '../../utils/i18n-next'
import { RedPacketStatus } from './types'

export function resolveRedPacketStatus(listOfStatus: RedPacketStatus[]) {
    if (listOfStatus.includes(RedPacketStatus.claimed)) return 'Claimed'
    if (listOfStatus.includes(RedPacketStatus.refunded)) return 'Refunded'
    if (listOfStatus.includes(RedPacketStatus.expired)) return 'Expired'
    if (listOfStatus.includes(RedPacketStatus.empty)) return 'Empty'
    return ''
}

export function resolveElapsedTime(from: number) {
    const msPerMinute = 60 * 1000
    const msPerHour = msPerMinute * 60
    const msPerDay = msPerHour * 24
    const msPerMonth = msPerDay * 30
    const msPerYear = msPerDay * 365
    const elapsed = Date.now() - from
    if (elapsed < msPerMinute)
        return i18n.t('plugin_red_packet_relative_time_seconds_ago', {
            seconds: Math.round(elapsed / 1000),
        })
    if (elapsed < msPerHour)
        return i18n.t('plugin_red_packet_relative_time_minutes_ago', {
            minutes: Math.round(elapsed / msPerMinute),
        })
    if (elapsed < msPerDay)
        return i18n.t('plugin_red_packet_relative_time_hours_ago', {
            hours: Math.round(elapsed / msPerHour),
        })
    if (elapsed < msPerMonth)
        return i18n.t('plugin_red_packet_relative_time_days_ago', {
            days: Math.round(elapsed / msPerDay),
        })
    if (elapsed < msPerYear)
        return i18n.t('plugin_red_packet_relative_time_months_ago', {
            months: Math.round(elapsed / msPerMonth),
        })
    return i18n.t('plugin_red_packet_relative_time_years_ago', {
        years: Math.round(elapsed / msPerYear),
    })
}
