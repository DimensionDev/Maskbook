import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { useDirtyDetectionDependency } from '@masknet/plugin-infra/dom'
import { makeStyles, ShadowRootPopper } from '@masknet/theme'
import { Link } from '@mui/material'
import { memo } from 'react'
import { useCheckLink } from '../hooks/useCheckLink.js'
import { useDetectAddress } from '../hooks/useDetectAddress.js'
import { AddressTag } from './TextModifier.js'
import { usePopoverControl } from './usePopoverControl.js'
import { WarningCard } from './WarningCard.js'

const useStyles = makeStyles()((theme) => ({
    link: {
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        verticalAlign: 'bottom',
        '& > a': {
            color: theme.palette.maskColor.danger,
        },
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

export const LinkModifier = memo<PropsOf<Plugin.SiteAdaptor.Definition['LinkModifier']>>(function LinkModifier({
    fallback,
    ...props
}) {
    const { classes } = useStyles()
    const { data, isLoading: isChecking } = useCheckLink(props.href, props.children)
    const { data: detected, isLoading: isDetecting } = useDetectAddress(data?.address, data?.isScam === false)
    const { open, anchorEl, iconRef, onMouseEnter, onMouseLeave } = usePopoverControl()

    const pending = isChecking || (data?.isScam === false && isDetecting)
    const isDirty = !!(data?.isScam || detected?.isScam)
    useDirtyDetectionDependency(isDirty, pending, props.href)

    if (!data?.isScam) {
        if (detected?.isScam) {
            return (
                <span className={classes.link}>
                    <AddressTag className={classes.address} address={data!.address!} nested text="" />
                    <Link href={props.href} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 'inherit' }}>
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
            <Link href={props.href} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 'inherit' }}>
                {props.children}
                {props.suggestedPostImage}
            </Link>
        </span>
    )
})
