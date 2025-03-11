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
import { extractAddresses } from '../../utils.js'
import { useDetectAddress } from '../hooks/useDetectAddress.js'
import { AddressTag } from './TextModifier.js'

const useStyles = makeStyles()({
    link: {
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        verticalAlign: 'bottom',
    },
    address: {
        display: 'contents',
    },
    icon: {
        width: 18,
        height: 18,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
    },
}))

function isTCO(url: string | null) {
    if (!url) return false
    return url.startsWith('https://t.co/')
}

export const LinkModifier = memo<PropsOf<Plugin.SiteAdaptor.Definition['LinkModifier']>>(function LinkModifier({
    fallback,
    ...props
}) {
    const { classes } = useStyles()
    const { data } = useQuery({
        queryKey: ['scam-warning', 'check-link', props.href, props.children],
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
            const isEllipsis = props.children.endsWith('…')
            // We assume that the link contains only one address
            const address = isEllipsis ? extractAddresses(resolvedLink, true)[0] : undefined

            return {
                isScam: await PluginScamRPC.checkUrl(resolvedLink),
                provider: SecurityProvider.ScamSniffer,
                resolvedLink,
                address,
            }
        },
    })
    const { data: detected } = useDetectAddress(data?.address, data?.isScam === false)
    const { open, anchorEl, iconRef, onMouseEnter, onMouseLeave } = usePopoverControl()

    if (!data?.isScam) {
        if (detected?.isScam) {
            return (
                <span className={classes.link}>
                    <AddressTag className={classes.address} address={data!.address!} nested text="" />
                    <Link href={props.href} target="_blank" rel="noopener noreferrer" fontSize="inherit">
                        {props.children}
                        {props.suggestedPostImage}
                    </Link>
                </span>
            )
        }
        return fallback
    }

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
