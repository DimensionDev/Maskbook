import { t } from '@lingui/macro'

export function formatTime(seconds: number) {
    console.log({ seconds })
    if (seconds < 60) return t`${seconds}s`
    const mins = (seconds / 60).toFixed(2)
    return t`${mins.replace(/\.?0+$/, '')}m`
}
