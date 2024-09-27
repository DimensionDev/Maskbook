import { type NextIDPlatform } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { resolveNextIDPlatformName } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { useRef, cloneElement, useEffect, useState, type ReactElement, type RefObject } from 'react'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()({
    title: {
        padding: '6px 2px',
    },
})

interface SocialTooltipProps<T> {
    platform?: NextIDPlatform
    // cloneElement is used.
    // eslint-disable-next-line @typescript-eslint/no-restricted-types
    children: ReactElement<T & { ref: RefObject<HTMLElement | null> }>
}
export function SocialTooltip<T extends object>({ children, platform }: SocialTooltipProps<T>) {
    const { classes } = useStyles()
    const [inView, setInView] = useState(false)
    const ref = useRef<HTMLElement>(null)
    const title =
        platform ?
            <Typography className={classes.title} fontSize={14}>
                <Trans>Data source is retrieved from {resolveNextIDPlatformName(platform) || platform}.</Trans>
            </Typography>
        :   null

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
