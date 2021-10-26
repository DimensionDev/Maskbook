import { Typography, Card, Box, CircularProgress, CircularProgressProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import classNames from 'classnames'
import { TypedMessage, makeTypedMessageText } from '../../protocols/typed-message'
import { TypedMessageRendererProps, DefaultTypedMessageRenderer } from './TypedMessageRenderer'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import green from '@mui/material/colors/green'
import { MaskIcon } from '../../resources/MaskIcon'
import { memo, useCallback, useMemo } from 'react'

export enum AdditionalIcon {
    check = 'check',
    error = 'error',
}
export interface AdditionalContentProps
    extends withClasses<never>,
        Omit<TypedMessageRendererProps<TypedMessage>, 'message'> {
    title: string
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
    title: { display: 'flex', alignItems: 'center' },
    icon: { marginRight: theme.spacing(1), display: 'flex', width: 24, height: 24 },
    content: { margin: theme.spacing(1, 0), padding: 0, overflowWrap: 'break-word' },
    rightIcon: { paddingLeft: theme.spacing(0.75) },
}))

export const AdditionalContent = memo(function AdditionalContent(props: AdditionalContentProps): JSX.Element {
    const classes = useStylesExtends(useStyles(), props)
    const stop = useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => ev.stopPropagation(), [])
    const { progress, title, message } = props
    const ProgressJSX = !progress ? null : progress === true ? (
        <CircularProgress size={20} color="primary" variant="indeterminate" />
    ) : (
        <CircularProgress size={20} color="primary" {...progress} />
    )
    const RightIconJSX = ((icon) => {
        const props = { fontSize: 'small', className: classes.rightIcon } as const
        if (icon === AdditionalIcon.check) return <CheckIcon htmlColor={green[500]} {...props} />
        if (icon === AdditionalIcon.error) return <CloseIcon color="error" {...props} />
        return null
    })(props.titleIcon)
    const header = (
        <Typography
            variant="caption"
            color={message ? 'textSecondary' : 'textPrimary'}
            gutterBottom
            className={classNames(classes.title)}>
            <span className={classes.icon}>{ProgressJSX || <MaskIcon />}</span>
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
            {message ? (
                <main className={classes.content}>
                    <DefaultTypedMessageRenderer {...props} message={TypedMessage} allowTextEnlarge={true} />
                </main>
            ) : null}
        </Card>
    )
})
