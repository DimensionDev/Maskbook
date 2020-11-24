import { map } from 'lodash-es'
import { makeNewBugIssueURL } from './issue'

export const DEBUG_INFO = {
    'User Agent': navigator.userAgent,
    'Maskbook Version': process.env.VERSION,
    'Build Date': process.env.BUILD_DATE,
    'Tag Name': process.env.TAG_NAME,
    'Commit Hash': process.env.COMMIT_HASH,
    'Commit Date': process.env.COMMIT_DATE,
    'Remote URL': process.env.REMOTE_URL,
    'Branch Name': process.env.BRANCH_NAME,
    Dirty: process.env.DIRTY,
    'Tag Dirty': process.env.TAG_DIRTY,
}

export const DebugInfo = () => {
    const onNewBugIssue = () => {
        open(makeNewBugIssueURL())
    }

    return (
        <>
            <pre>{map(DEBUG_INFO, (value, key) => `${key}: ${value}`).join('\n')}</pre>
            <button onClick={onNewBugIssue}>New bug issue</button>
        </>
    )
}
