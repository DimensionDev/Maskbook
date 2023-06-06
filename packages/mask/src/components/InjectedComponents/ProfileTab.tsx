import { type ReactElement, useCallback, useEffect, useState } from 'react'
import { useMount } from 'react-use'
import { Typography } from '@mui/material'
import { MaskMessages, useMatchXS, useLocationChange } from '../../utils/index.js'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { ProfileTabs } from '@masknet/shared-base'

export interface ProfileTabProps extends withClasses<'tab' | 'button' | 'selected'> {
    clear(): void
    reset(): void
    children?: ReactElement
    // Required! This component don't have it own style.
    classes: Record<'root' | 'button' | 'selected', string>
    title: string
    type?: ProfileTabs
    icon?: React.ReactNode
}

export function ProfileTab(props: ProfileTabProps) {
    const { reset, clear, children, classes, title, type = ProfileTabs.WEB3 } = props
    const [active, setActive] = useState(false)
    const isMobile = useMatchXS()

    const switchToTab = useCallback(() => {
        MaskMessages.events.profileTabUpdated.sendToLocal({ show: true, type })
        setActive(true)
        clear()
    }, [clear, type])

    const onClick = useCallback(() => {
        // Change the url hashtag to trigger `locationchange` event from e.g. 'hostname/medias#web3 => hostname/medias'
        isTwitter(activatedSocialNetworkUI) && location.assign('#' + type)
        switchToTab()
    }, [switchToTab, type])

    useMount(() => {
        if (location.hash !== '#' + type || active || location.pathname === '/search') return
        switchToTab()
    })

    useLocationChange(() => {
        const testId = (document.activeElement as HTMLElement | null)?.dataset.testid
        if (testId === 'SearchBox_Search_Input') return

        MaskMessages.events.profileTabUpdated.sendToLocal({ show: false })
        setActive(false)
        reset()
    })

    useEffect(() => {
        return MaskMessages.events.profileTabActive.on((data) => {
            setActive(data.active)
        })
    }, [])

    return (
        <div key="nfts" className={classes.root}>
            <Typography
                className={classes.button + ' ' + (active ? classes.selected : '')}
                onClick={onClick}
                component="div">
                {props.icon}
                {isMobile && props.icon ? null : title}
                {active && children ? children : null}
            </Typography>
        </div>
    )
}
