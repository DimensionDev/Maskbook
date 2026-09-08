import { useCopyToClipboard, useTimeoutFn } from 'react-use'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, IconButton, Typography, Alert, AlertTitle, styled, type TypographyProps } from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import { useBuildInfoMarkdown, type ErrorBoundaryError } from './context.js'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Trans } from '@lingui/react/macro'

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
        if (!error.message.includes("Failed to execute 'insertBefore' on 'Node'")) return
        onRetry()
    }, 200)

    // crash report, will send to GitHub
    const reportTitle = `[Crash] ${error.type}: ${error.message}`
    const reportBody = `<!--Thanks for the crash report!
Please write down what you're doing when the crash happened, that will help us to fix it easier!-->

I was *doing something...*, then Mask reports an error.

> ${error.message}

Error stack:

<pre>${error.stack}</pre>\n\n${context || ''}`

    // a clean text version of the report (no GitHub template comments/placeholders) for one-click copy
    const fullReport = `${reportTitle}

Error stack:

${error.stack}

${context || ''}`.trim()

    const githubLink = useMemo(() => {
        const url = new URLSearchParams()
        url.set('title', reportTitle)
        url.set('body', reportBody)
        return 'https://github.com/DimensionDev/Maskbook/issues/new?template=bug.md' + url.toString()
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
                    <Button variant="contained" color="primary" size="small" onClick={onRetry}>
                        <Trans>Try to recover</Trans>
                    </Button>
                    <Button href={githubLink} color="primary" size="small" target="_blank">
                        <Trans>Report on GitHub</Trans>
                    </Button>
                    <CopyReportButton text={fullReport} />
                    <IconButtonContainer>
                        <IconButton color="inherit" size="small" onClick={() => setShowStack((x) => !x)}>
                            {showStack ?
                                <ExpandMore />
                            :   <ExpandLess />}
                        </IconButton>
                    </IconButtonContainer>
                </ActionArea>
                {showStack ?
                    <ErrorStack component="pre">
                        <code>{error.stack}</code>
                    </ErrorStack>
                :   null}
            </Alert>
        </Root>
    )
}
const Root = styled('div')({
    overflowX: 'auto',
    flex: 1,
    width: '100%',
    contain: 'paint',
    padding: 8,
})

const ErrorTitle = styled('div')({
    userSelect: 'text',
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: 'break-word',
})

// TypographyProps (rather than the inferred props of Typography) keeps the polymorphic
// `component` prop, which plain styled(Typography) would drop from the type.
const ErrorStack = styled(Typography)<TypographyProps>({
    userSelect: 'text',
    margin: 0,
    marginTop: 16,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: 12,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: 360,
    overflowY: 'auto',
})

const ActionArea = styled('div')({
    display: 'flex',
    gap: 8,
    '@media screen and (max-width: 500px)': {
        flexDirection: 'column',
        gap: 8,
    },
})

const IconButtonContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
})

// Local copy button (cf. packages/injected-ui/src/CopyIconButton.tsx): importing CopyButton from
// @masknet/shared would create a circular dependency (shared depends on shared-base-ui).
function CopyReportButton(props: { text: string }) {
    const [, copyToClipboard] = useCopyToClipboard()
    const [copied, setCopied] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
    useEffect(() => () => clearTimeout(timerRef.current), [])

    const handleCopy = useCallback(() => {
        copyToClipboard(props.text)
        setCopied(true)
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(setCopied, 1500, false)
    }, [props.text])

    return (
        <Button
            color="primary"
            size="small"
            onClick={handleCopy}
            startIcon={copied ? <Icons.Check size={16} /> : <Icons.Copy size={16} />}>
            {copied ?
                <Trans>Copied!</Trans>
            :   <Trans>Copy report</Trans>}
        </Button>
    )
}
