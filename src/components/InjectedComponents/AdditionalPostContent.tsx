import * as React from 'react'
import { getUrl } from '../../utils/utils'
import { makeStyles, Typography, Card } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import classNames from 'classnames'
import { TypedMessageText, TypedMessage } from '../../extension/background-script/CryptoServices/utils'
import { TypedMessageRendererProps, DefaultTypedMessageRenderer } from './TypedMessageRenderer'

export interface AdditionalContentProps
    extends withClasses<KeysInferFromUseStyles<typeof useStyles>>,
        Omit<TypedMessageRendererProps<TypedMessage>, 'message'> {
    /**
     * if it is a React Node, it will replaced the default header.
     * if it is a string, it will used as title in the default header.
     */
    header: React.ReactNode | string
    /** this component does not accept children */
    children?: never
    /** Can handle typed message or normal string */
    message?: TypedMessage | string
}
const useStyles = makeStyles({
    root: { backgroundColor: 'transparent' },
    title: { display: 'flex', alignItems: 'center' },
    icon: {},
})

export const AdditionalContent = React.memo(function AdditionalContent(props: AdditionalContentProps) {
    const classes = useStylesExtends(useStyles(), props)
    const icon = getUrl('/maskbook-icon-padded.png')
    const stop = React.useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => ev.stopPropagation(), [])
    const header =
        typeof props.header === 'string' ? (
            <Typography variant="caption" color="textSecondary" gutterBottom className={classNames(classes.title)}>
                <img alt="" width={16} height={16} src={icon} className={classes.icon} />
                {props.header}
            </Typography>
        ) : (
            props.header
        )
    const typedMessage =
        typeof props.message === 'string'
            ? ({
                  content: props.message,
                  type: 'text',
                  version: 1,
              } as TypedMessageText)
            : props.message
    const TypedMessageRenderer = props.TypedMessageRenderer || DefaultTypedMessageRenderer
    return (
        <Card className={classes.root} elevation={0} onClick={stop}>
            {header}
            {typedMessage ? <TypedMessageRenderer {...props} message={typedMessage} /> : null}
        </Card>
    )
})
