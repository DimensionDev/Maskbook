import { useTimeoutFn } from 'react-use'
import { useMemo, useState, useContext } from 'react'
import { Box, Button, IconButton, Typography, Alert, AlertTitle, styled } from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { ErrorBoundaryBuildInfoContext, ErrorBoundaryError } from './context'
import { useSharedBaseI18N } from '../../locales'

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
    const context = useContext(ErrorBoundaryBuildInfoContext)
    const t = useSharedBaseI18N()

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
            <Alert severity="error" variant="outlined">
                <AlertTitle>{t.error_boundary_crash_title({ subject })}</AlertTitle>
                <ErrorTitle>
                    {error.type}: {error.message}
                </ErrorTitle>
                <ActionArea>
                    <Button variant="contained" color="primary" onClick={onRetry}>
                        {t.error_boundary_try_to_recover()}
                    </Button>
                    <Button href={githubLink} color="primary" target="_blank">
                        {t.error_boundary_report_github()}
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <IconButton color="inherit" size="small" onClick={() => setShowStack((x) => !x)}>
                        {showStack ? <ExpandMore /> : <ExpandLess />}
                    </IconButton>
                </ActionArea>
                {showStack ? (
                    <ErrorStack>
                        <Typography component="pre">
                            <code>{error.stack}</code>
                        </Typography>
                    </ErrorStack>
                ) : null}
            </Alert>
        </Root>
    )
}
const Root = styled('div')`
    overflow-x: auto;
    flex: 1;
    width: 100%;
    contain: paint;
    margin-top: 16px;
`

const ErrorTitle = styled('div')`
    user-select: text;
    margin-bottom: 8px;
`

const ErrorStack = styled('div')`
    user-select: text;
    overflow-x: auto;
    height: 300px;
`

const ActionArea = styled('div')`
    display: flex;
    gap: 8px;
`
