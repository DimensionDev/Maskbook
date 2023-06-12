import { useSharedI18N } from '@masknet/shared'
import { type NextIDPlatform } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { resolveNextIDPlatformName } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { useRef, cloneElement, useEffect, useState } from 'react'
import type { ReactElement } from 'react-markdown/lib/react-markdown.js'

const useStyles = makeStyles()({
    title: {
        padding: '6px 2px',
    },
})

interface SocialTooltipProps {
    platform?: NextIDPlatform
    // cloneElement is used.
    // eslint-disable-next-line @typescript-eslint/ban-types
    children: ReactElement
}
export function SocialTooltip({ children, platform }: SocialTooltipProps) {
    const { classes } = useStyles()
    const [inView, setInView] = useState(false)

    const t = useSharedI18N()
    const ref = useRef<HTMLElement>(null)
    const title = platform ? (
        <Typography className={classes.title} fontSize={14}>
            {t.account_icon_tooltips({ source: resolveNextIDPlatformName(platform) || platform })}
        </Typography>
    ) : null

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                setInView(entry.isIntersecting)
            },
            {
                root: null,
                rootMargin: '0px',
            },
        )

        observer.observe(el)
        return () => observer.unobserve(el)
    }, [])

    return (
        <ShadowRootTooltip
            PopperProps={{ sx: { display: inView ? 'block' : 'none' } }}
            disableInteractive
            arrow
            placement="top"
            title={title}>
            {cloneElement(children, { ...children.props, ref })}
        </ShadowRootTooltip>
    )
}
