import { map } from 'lodash-es'
import { makeNewBugIssueURL } from './issue.js'
import { useI18N } from '../../utils/index.js'
import { openWindow } from '@masknet/shared-base-ui'
export const DEBUG_INFO = {
    'User Agent': navigator.userAgent,
    'Mask Version': process.env.VERSION,
    'Build Date': process.env.channel_DATE,
    'Commit Hash': process.env.COMMIT_HASH,
    'Commit Date': process.env.COMMIT_DATE,
    'Branch Name': process.env.BRANCH_NAME,
    Dirty: process.env.DIRTY,
}

function onNewBugIssue() {
    return openWindow(makeNewBugIssueURL())
}
export function DebugInfo() {
    const { t } = useI18N()

    return (
        <>
            <pre>{map(DEBUG_INFO, (value, key) => `${key}: ${value}`).join('\n')}</pre>
            <button type="button" onClick={onNewBugIssue}>
                {t('debug_new_bug_issue')}
            </button>
        </>
    )
}
