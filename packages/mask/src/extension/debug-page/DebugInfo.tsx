import { useI18N } from '../../utils/index.js'
import { BuildInfo, openWindow } from '@masknet/shared-base-ui'
import { useContext, useRef } from 'react'

export function DebugInfo() {
    const { t } = useI18N()
    const data = useRef(useContext(BuildInfo)).current()

    const url = new URLSearchParams()
    url.set('title', '[Bug] ')
    url.set('body', data)
    const link = 'https://github.com/DimensionDev/Maskbook/issues/new?' + url.toString()

    return (
        <>
            <pre>{data}</pre>
            <button type="button" onClick={() => openWindow(link)}>
                {t('debug_new_bug_issue')}
            </button>
        </>
    )
}
