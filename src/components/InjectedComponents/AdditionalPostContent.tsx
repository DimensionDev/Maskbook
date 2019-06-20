import * as React from 'react'
import { getUrl } from '../../utils/utils'
import { makeStyles, Divider, Typography } from '@material-ui/core'

interface Props {
    title: React.ReactNode
    children?: any
}
const useStyles = makeStyles({
    upDivider: { marginBottom: 6 },
    title: { display: 'flex' },
    icon: { transform: 'translate(-1px, -1px)' },
    content: {
        marginBottom: 6,
        marginTop: 6,
        lineHeight: 1.2,
    },
})
export function AdditionalContent(props: Props) {
    const classes = useStyles()
    const icon = getUrl('/maskbook-icon-padded.png')
    return (
        <>
            <Divider className={classes.upDivider} />
            <Typography variant="caption" className={classes.title}>
                <img alt="" width={16} height={16} src={icon} className={classes.icon} />
                {props.title}
            </Typography>
            <Typography variant="body1" className={classes.content}>
                {props.children}
            </Typography>
            <Divider />
        </>
    )
}
