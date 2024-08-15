import { EmptyStatus } from '@masknet/shared'
import { useTraderTrans } from '../../../locales/i18n_generated.js'

export function HistoryTitle() {
    const t = useTraderTrans()
    return <>{t.history()}</>
}

export function HistoryView() {
    return <EmptyStatus>Work in progress</EmptyStatus>
}
