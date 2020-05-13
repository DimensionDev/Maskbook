import * as React from 'react'
import { getUrl } from '../../utils/utils'
import { makeStyles, Typography, Card, Theme, Box, CircularProgress, CircularProgressProps } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import classNames from 'classnames'
import { textIntoTypedMessage, TypedMessage } from '../../extension/background-script/CryptoServices/utils'
import { TypedMessageRendererProps, DefaultTypedMessageRenderer } from './TypedMessageRenderer'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import green from '@material-ui/core/colors/green'

export enum AdditionalIcon {
    check = 'check',
    error = 'error',
}
export interface AdditionalContentProps
    extends withClasses<KeysInferFromUseStyles<typeof useStyles>>,
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
const useStyles = makeStyles((theme: Theme) => ({
    root: { backgroundColor: 'transparent', borderColor: theme.palette.primary.light, marginTop: theme.spacing(1) },
    title: { display: 'flex', alignItems: 'center' },
    icon: { paddingRight: theme.spacing(0.75), display: 'flex', width: 20, height: 20 },
    content: { margin: theme.spacing(1), padding: 0 },
    rightIcon: { paddingLeft: theme.spacing(0.75) },
}))

export const AdditionalContent = React.memo(function AdditionalContent(props: AdditionalContentProps) {
    const classes = useStylesExtends(useStyles(), props)
    const icon = getUrl('/maskbook-icon-padded.png')
    const stop = React.useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => ev.stopPropagation(), [])
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
            <span className={classes.icon}>{ProgressJSX || <img alt="" width={20} height={20} src={icon} />}</span>
            <Box flex={1} display="flex">
                {title}
                {RightIconJSX}
            </Box>
            {props.headerActions}
        </Typography>
    )
    const TypedMessageRenderer = props.TypedMessageRenderer || DefaultTypedMessageRenderer
    const TypedMessage = React.useMemo(() => (message ? textIntoTypedMessage(message) : null!), [message])
    return (
        <Card variant="outlined" className={classes.root} elevation={0} onClick={stop}>
            <header className={classes.content}>{header}</header>
            {message ? (
                <main className={classes.content}>
                    <TypedMessageRenderer {...props} message={TypedMessage} />
                </main>
            ) : null}
        </Card>
    )
})
