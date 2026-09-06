import { Typography, Card, Box, CircularProgress, type CircularProgressProps, colors } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material'
import { memo, useCallback, type JSX, type ReactNode } from 'react'
import { Icons } from '@masknet/icons'

enum AdditionalIcon {
    check = 'check',
    error = 'error',
}
export interface AdditionalContentProps {
    title: ReactNode
    titleIcon?: keyof typeof AdditionalIcon
    headerActions?: React.ReactNode
    progress?: boolean | CircularProgressProps
    /** this component does not accept children */
    // eslint-disable-next-line @eslint-react/no-unused-props
    children?: never
    /** Already-rendered message content - the container renders TypedMessage/plain text before passing it down. */
    message?: ReactNode
}
const useStyles = makeStyles()((theme) => ({
    root: { boxSizing: 'border-box', width: '100%', backgroundColor: 'transparent', borderColor: 'transparent' },
    title: { display: 'flex', alignItems: 'center', fontSize: 'inherit' },
    icon: { marginRight: theme.spacing(1), display: 'flex', width: 18, height: 18 },
    content: { margin: theme.spacing(1, 0), padding: 0, overflowWrap: 'break-word' },
    rightIcon: { paddingLeft: theme.spacing(0.75) },
}))

/**
 * The card used for post-level status messages injected above a post: decrypting-in-progress,
 * decryption failed, and (in production, via a container that pre-renders the TypedMessage tree)
 * the decrypted content itself. See
 * packages/mask/content-script/components/InjectedComponents/DecryptedPost/DecryptedPost.tsx.
 */
export const AdditionalContent = memo(function AdditionalContent(props: AdditionalContentProps): JSX.Element {
    const { classes } = useStyles()
    const stop = useCallback((ev: React.MouseEvent<HTMLDivElement>) => ev.stopPropagation(), [])
    const { progress, title, message } = props
    const ProgressJSX =
        progress ?
            progress === true ?
                <CircularProgress size={20} color="primary" variant="indeterminate" />
            :   <CircularProgress size={20} color="primary" {...progress} />
        :   null
    const RightIconJSX = ((icon) => {
        const props = { fontSize: 'small', className: classes.rightIcon } as const
        if (icon === AdditionalIcon.check) return <CheckIcon htmlColor={colors.green[500]} {...props} />
        if (icon === AdditionalIcon.error) return <CloseIcon color="error" {...props} />
        return null
    })(props.titleIcon)
    const header = (
        <Typography
            variant="caption"
            color={message ? 'textSecondary' : 'textPrimary'}
            gutterBottom
            className={classes.title}>
            <span className={classes.icon}>{ProgressJSX || <Icons.MaskBlue size={18} />}</span>
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                }}>
                {title}
                {RightIconJSX}
            </Box>
            {props.headerActions}
        </Typography>
    )
    return (
        <Card variant="outlined" className={classes.root} elevation={0} onClick={stop}>
            <header className={classes.content}>{header}</header>
            {message ?
                <main className={classes.content}>{message}</main>
            :   null}
        </Card>
    )
})
