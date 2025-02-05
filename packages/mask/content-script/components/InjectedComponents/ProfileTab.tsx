import { useCallback, useEffect, useState, type PropsWithChildren } from 'react'
import { useMount } from 'react-use'
import { Typography } from '@mui/material'
import { MaskMessages, ProfileTabs, Sniffings } from '@masknet/shared-base'
import { useMatchXS, useLocationChange } from '@masknet/shared-base-ui'

interface ProfileTabProps extends withClasses<'tab' | 'button' | 'selected'>, PropsWithChildren {
    clear(): void
    reset(): void
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
        Sniffings.is_twitter_page && location.assign('#' + type)
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
        <div key="web3" className={classes.root}>
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
