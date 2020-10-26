const body = `\
# Bug Report

## Environment

User Agent: ${navigator.userAgent}
Version: ${process.env.VERSION}
Tag Name: ${process.env.TAG_NAME}
Build Date: ${process.env.BUILD_DATE}
Commit Hash: ${process.env.COMMIT_HASH}
Commit Date: ${process.env.COMMIT_DATE}
Remote URL: ${process.env.REMOTE_URL}
Branch Name: ${process.env.BRANCH_NAME}

## Bug Info

### Actual Behavior

/* What happened? */\
`

export const makeNewBugIssueURL = () => {
    const url = new URL('https://github.com/DimensionDev/Maskbook/issues/new')
    url.searchParams.append('title', '[Bug] ')
    url.searchParams.append('labels', 'Type: Bug')
    url.searchParams.append('assignees', 'Jack-Works, jk234ert')
    url.searchParams.append('body', body)
    return url.toString()
}
