import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { makeStyles, ShadowRootPopper } from '@masknet/theme'
import { Link } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { memo } from 'react'
import { usePopoverControl } from './usePopoverControl.js'
import { WarningCard } from './WarningCard.js'

const useStyles = makeStyles()({
    link: {
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        verticalAlign: 'bottom',
    },
    icon: {
        width: 18,
        height: 18,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
    },
})

export const LinkModifier = memo<PropsOf<Plugin.SiteAdaptor.Definition['LinkModifier']>>(function ModifyLink({
    fallback,
    ...props
}) {
    const { classes } = useStyles()
    const { data: isScam = true } = useQuery({
        queryKey: ['scam-warning', 'check-link', props.href],
        queryFn: () => {
            // return PluginScamRPC.checkUrl(props.href) || true
            return true
        },
    })
    const { open, anchorEl, iconRef, onMouseEnter, onMouseLeave } = usePopoverControl()

    if (!isScam) return fallback

    return (
        <span className={classes.link}>
            <Icons.Danger
                size={18}
                className={classes.icon}
                ref={iconRef}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            />
            <ShadowRootPopper open={open} anchorEl={anchorEl}>
                <WarningCard
                    link={props.href}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onClick={(e) => e.stopPropagation()}
                />
            </ShadowRootPopper>
            <Link href={props.href} target="_blank" rel="noopener noreferrer" fontSize="inherit">
                {props.children}
                {props.suggestedPostImage}
            </Link>
        </span>
    )
})
