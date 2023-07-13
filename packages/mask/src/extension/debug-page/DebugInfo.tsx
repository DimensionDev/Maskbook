import { useI18N } from '../../utils/index.js'
import { useBuildInfoMarkdown, openWindow, useBuildInfo } from '@masknet/shared-base-ui'

export function DebugInfo() {
    const { t } = useI18N()
    const info = useBuildInfo()
    const markdown = useBuildInfoMarkdown()

    const url = new URLSearchParams()
    url.set('title', '[Bug] ')
    url.set('body', markdown)
    const link = 'https://github.com/DimensionDev/Maskbook/issues/new?' + url.toString()

    return (
        <>
            <pre>{JSON.stringify(info, undefined, 4)}</pre>
            <button type="button" onClick={() => openWindow(link)}>
                {t('debug_new_bug_issue')}
            </button>
        </>
    )
}
