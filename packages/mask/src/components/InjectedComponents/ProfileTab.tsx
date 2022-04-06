import { ReactElement, useCallback, useState } from 'react'
import classnames from 'classnames'
import { Typography } from '@mui/material'
import { MaskMessages, useMatchXS, useLocationChange } from '../../utils'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { activatedSocialNetworkUI } from '../../social-network'

export interface ProfileTabProps extends withClasses<'tab' | 'button' | 'selected'> {
    clear(): void
    reset(): void
    children?: ReactElement
    // Required! This component don't have it own style.
    classes: Record<'root' | 'button' | 'selected', string>
    title: string
    icon?: React.ReactNode
}

export function ProfileTab(props: ProfileTabProps) {
    const { reset, clear, children, classes, title } = props
    const [active, setActive] = useState(false)
    const isMobile = useMatchXS()

    const onClick = useCallback(() => {
        // Change the url hashtag to trigger `locationchange` event from e.g. 'hostname/medias#web3 => hostname/medias'
        isTwitter(activatedSocialNetworkUI) && location.assign('#web3')
        MaskMessages.events.profileTabUpdated.sendToLocal({ show: true })
        setActive(true)
        clear()
    }, [clear])

    useLocationChange(() => {
        MaskMessages.events.profileTabUpdated.sendToLocal({ show: false })
        setActive(false)
        reset()
    })

    return (
        <div key="nfts" className={classes.root}>
            <Typography
                className={classnames(classes.button, active ? classes.selected : '')}
                onClick={onClick}
                component="div">
                {props.icon}
                {isMobile && props.icon ? null : title}
                {active && children ? children : null}
            </Typography>
        </div>
    )
}
