import { useTimeoutFn } from 'react-use'
import { useMemo, useState } from 'react'
import { Button, IconButton, Typography, Alert, AlertTitle, styled } from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import { useBuildInfoMarkdown, type ErrorBoundaryError } from './context.js'
import { makeStyles } from '@masknet/theme'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()({
    message: { flex: 1 },
})
export interface CrashUIProps extends React.PropsWithChildren<ErrorBoundaryError> {
    /** Type of the Error */
    type: string
    /** The Error message */
    message: string
    /** The error stack */
    stack: string
    /** The component part in the boundary */
    subject: string
    onRetry: () => void
}
export function CrashUI({ onRetry, subject, ...error }: CrashUIProps) {
    const context = useBuildInfoMarkdown()
    const { classes } = useStyles()

    const [showStack, setShowStack] = useState(false)

    // This is a rarely reported crash. It is likely a race condition.
    // https://github.com/DimensionDev/Maskbook/issues?q=Failed+to+execute+%27insertBefore%27+on+%27Node%27+
    // It seems like DOM mutation from out of our application might conflict with React reconciliation.
    // As a temporary fix, try to recover this React tree after 200ms.
    useTimeoutFn(() => {
        if (error.message.includes("Failed to execute 'insertBefore' on 'Node'")) {
            onRetry()
        }
    }, 200)

    // crash report, will send to GitHub
    const reportTitle = `[Crash] ${error.type}: ${error.message}`
    const reportBody = `<!--Thanks for the crash report!
Please write down what you're doing when the crash happened, that will help us to fix it easier!-->

I was *doing something...*, then Mask reports an error.

> ${error.message}

Error stack:

<pre>${error.stack}</pre>\n\n${context || ''}`

    const githubLink = useMemo(() => {
        const url = new URLSearchParams()
        url.set('title', reportTitle)
        url.set('body', reportBody)
        return 'https://github.com/DimensionDev/Maskbook/issues/new?' + url.toString()
    }, [reportBody, reportTitle])
    return (
        <Root>
            <Alert severity="error" variant="outlined" classes={{ message: classes.message }}>
                <AlertTitle>
                    <Trans>{subject} has an error</Trans>
                </AlertTitle>
                <ErrorTitle>
                    {error.type}: {error.message}
                </ErrorTitle>
                <ActionArea>
                    <Button variant="contained" color="primary" onClick={onRetry}>
                        <Trans>Try to recover</Trans>
                    </Button>
                    <Button href={githubLink} color="primary" target="_blank">
                        <Trans>Report on GitHub</Trans>
                    </Button>
                    <IconButtonContainer>
                        <IconButton color="inherit" size="small" onClick={() => setShowStack((x) => !x)}>
                            {showStack ?
                                <ExpandMore />
                            :   <ExpandLess />}
                        </IconButton>
                    </IconButtonContainer>
                </ActionArea>
                {showStack ?
                    <ErrorStack>
                        <Typography component="pre">
                            <code>{error.stack}</code>
                        </Typography>
                    </ErrorStack>
                :   null}
            </Alert>
        </Root>
    )
}
const Root = styled('div')`
    overflow-x: auto;
    flex: 1;
    width: 100%;
    contain: paint;
    padding: 8px;
`

const ErrorTitle = styled('div')`
    user-select: text;
    margin-bottom: 8px;
`

const ErrorStack = styled('div')`
    user-select: text;
    overflow-x: auto;
    margin-top: 16px;
`

const ActionArea = styled('div')`
    display: flex;
    gap: 8px;
    @media screen and (max-width: 500px) {
        flex-direction: column;
        gap: 8px;
    }
`

const IconButtonContainer = styled('div')`
    display: flex;
    justify-content: center;
    align-items: center;
`
