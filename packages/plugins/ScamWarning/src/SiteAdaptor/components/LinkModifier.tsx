import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { resolveTCOLink } from '@masknet/plugin-infra/dom/context'
import { makeStyles, ShadowRootPopper } from '@masknet/theme'
import { Link } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { memo } from 'react'
import { PluginScamRPC } from '../../messages.js'
import { usePopoverControl } from './usePopoverControl.js'
import { WarningCard } from './WarningCard.js'
import { SecurityProvider } from '../../constants.js'
import { GoPlusLabs } from '@masknet/web3-providers'

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

function isTCO(url: string | null) {
    if (!url) return false
    return url.startsWith('https://t.co/')
}

export const LinkModifier = memo<PropsOf<Plugin.SiteAdaptor.Definition['LinkModifier']>>(function ModifyLink({
    fallback,
    ...props
}) {
    const { classes } = useStyles()
    const { data } = useQuery({
        queryKey: ['scam-warning', 'check-link', props.href],
        queryFn: async () => {
            const resolvedLink = isTCO(props.href) ? await resolveTCOLink(props.href) : props.href
            if (!resolvedLink) return { isScam: false }
            const result = await GoPlusLabs.checkIsPhishingSite(resolvedLink)
            if (result)
                return {
                    isScam: result,
                    provider: SecurityProvider.GoPlus,
                    resolvedLink,
                }
            return {
                isScam: await PluginScamRPC.checkUrl(resolvedLink),
                provider: SecurityProvider.ScamSniffer,
                resolvedLink,
            }
        },
    })
    const { open, anchorEl, iconRef, onMouseEnter, onMouseLeave } = usePopoverControl()

    if (!data?.isScam) return fallback

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
                    link={data.resolvedLink || props.href}
                    securityProvider={data.provider!}
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
