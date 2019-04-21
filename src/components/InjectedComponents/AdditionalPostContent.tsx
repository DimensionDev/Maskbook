import * as React from 'react'
import Divider from '@material-ui/core/Divider/Divider'
import Typography from '@material-ui/core/Typography/Typography'
import { getUrl } from '../../utils/utils'
import { withStylesTyped } from '../../utils/theme'

interface Props {
    title: React.ReactNode
    children?: any
}
export const AdditionalContent = withStylesTyped({
    upDivider: {
        marginBottom: 6,
        // TODO: ? is this useful?
        marginBlock: 6,
    },
    title: {
        display: 'flex',
    },
    icon: {
        transform: 'translate(-1px, -1px)',
        width: 16,
        height: 16,
    },
    content: {
        marginBottom: 6,
        marginTop: 6,
        lineHeight: 1.2,
    },
})<Props>(({ classes, ...props }) => {
    const icon = getUrl('/maskbook-icon-padded.png')
    return (
        <>
            <Divider className={classes.upDivider} />
            <Typography variant="caption" className={classes.title}>
                <img src={icon} className={classes.icon} />
                {props.title}
            </Typography>
            <Typography variant="body1" className={classes.content}>
                {props.children}
            </Typography>
            <Divider />
        </>
    )
})
