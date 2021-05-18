import { Card, makeStyles } from '@material-ui/core'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { isTwitter as isTwitterF } from '../../../../social-network-adaptor/twitter.com/base'

const useStyles = makeStyles((theme) => {
    const isTwitter = isTwitterF(activatedSocialNetworkUI)
    return {
        root: {
            width: 450,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            ...(isTwitter
                ? {
                      boxShadow: `${
                          theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px'
                              : 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px'
                      }`,
                  }
                : {
                      border: `1px solid ${theme.palette.divider}`,
                  }),
        },
    }
})

export interface TrendingCardProps extends withClasses<'root'> {
    children?: React.ReactNode
}

export function TrendingCard(props: TrendingCardProps) {
    const { children } = props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <Card className={classes.root} elevation={0} component="article">
            {children}
        </Card>
    )
}
