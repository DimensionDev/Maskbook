import { Typography, Card, Box, CircularProgress, type CircularProgressProps, colors } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { type TypedMessage, makeTypedMessageText } from '@masknet/typed-message'
import { TypedMessageRender } from '@masknet/typed-message-react'
import { TypedMessageRenderContext } from '../../../shared-ui/TypedMessageRender/context.js'
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material'
import { memo, useCallback, useMemo, type JSX, type ReactNode } from 'react'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/ui.js'
import { Icons } from '@masknet/icons'

enum AdditionalIcon {
    check = 'check',
    error = 'error',
}
interface AdditionalContentProps {
    title: ReactNode
    titleIcon?: keyof typeof AdditionalIcon
    headerActions?: React.ReactNode
    progress?: boolean | CircularProgressProps
    /** this component does not accept children */
    children?: never
    /** Can handle typed message or normal string */
    message?: TypedMessage | string
}
const useStyles = makeStyles()((theme) => ({
    root: { boxSizing: 'border-box', width: '100%', backgroundColor: 'transparent', borderColor: 'transparent' },
    title: { display: 'flex', alignItems: 'center', fontSize: 'inherit' },
    icon: { marginRight: theme.spacing(1), display: 'flex', width: 18, height: 18 },
    content: { margin: theme.spacing(1, 0), padding: 0, overflowWrap: 'break-word' },
    rightIcon: { paddingLeft: theme.spacing(0.75) },
}))

export const AdditionalContent = memo(function AdditionalContent(props: AdditionalContentProps): JSX.Element {
    const { classes } = useStyles()
    const stop = useCallback((ev: React.MouseEvent<HTMLDivElement>) => ev.stopPropagation(), [])
    const { progress, title, message } = props
    const ProgressJSX =
        !progress ? null
        : progress === true ? <CircularProgress size={20} color="primary" variant="indeterminate" />
        : <CircularProgress size={20} color="primary" {...progress} />
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
    const TypedMessage = useMemo(() => {
        if (typeof message === 'string') return makeTypedMessageText(message)
        if (typeof message === 'undefined') return makeTypedMessageText('')
        return message
    }, [message])
    return (
        <Card variant="outlined" className={classes.root} elevation={0} onClick={stop}>
            <header className={classes.content}>{header}</header>
            {message ?
                <main className={classes.content}>
                    <TypedMessageRenderContext
                        textResizer={activatedSiteAdaptorUI!.networkIdentifier !== 'twitter.com'}
                        renderFragments={activatedSiteAdaptorUI?.customization.componentOverwrite?.RenderFragments}>
                        <TypedMessageRender message={TypedMessage} />
                    </TypedMessageRenderContext>
                </main>
            :   null}
        </Card>
    )
})
