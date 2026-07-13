import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { makeStyles, ShadowRootPopper } from '@masknet/theme'
import { Fragment, memo, useMemo } from 'react'
import { extractAddresses } from '../../utils.js'
import { usePopoverControl } from './usePopoverControl.js'
import { WarningCard } from './WarningCard.js'
import { useDetectAddress } from '../hooks/useDetectAddress.js'
import { useDirtyDetectionDependency } from '@masknet/plugin-infra/dom'

const useStyles = makeStyles()((theme) => ({
    text: {
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        verticalAlign: 'bottom',
        color: theme.palette.maskColor.danger,
    },
    icon: {
        width: 18,
        height: 18,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
    },
}))

type TextModifierProps = PropsOf<Plugin.SiteAdaptor.Definition['TextModifier']>

interface AddressTagProps {
    address: string
    text: string
    nested?: boolean
    className?: string
}

export const AddressTag = memo<AddressTagProps>(function AddressTag({ address, text, className, nested }) {
    const { classes, cx } = useStyles()
    const { open, anchorEl, iconRef, onMouseEnter, onMouseLeave } = usePopoverControl()
    const { data } = useDetectAddress(address)

    if (!data?.isScam) return text
    return (
        <span className={cx(classes.text, className)}>
            <Icons.Danger
                size={18}
                className={classes.icon}
                ref={iconRef}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            />
            {nested ? null : address}
            <ShadowRootPopper open={open} anchorEl={anchorEl}>
                <WarningCard
                    address={address}
                    securityProvider={data.provider!}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onClick={(e) => e.stopPropagation()}
                />
            </ShadowRootPopper>
        </span>
    )
})

interface Segment {
    type: 'text' | 'address'
    value: string
}

export const TextModifier = memo<TextModifierProps>(function TextModifier({ fallback, children: fullText }) {
    const addresses = useMemo(() => extractAddresses(fullText), [fullText])

    const segments = useMemo(() => {
        let leftOffset = 0
        let offset = 0
        const segments: Segment[] = []
        const list = [...addresses]
        while (list.length) {
            const address = list[0]
            const index = fullText.indexOf(list[0], leftOffset)
            if (index === -1) continue

            const padding = address.startsWith(' ') ? ' ' : '' // leading padding
            leftOffset = index + padding.length
            const rightOffset = index + address.length
            segments.push(
                { type: 'text', value: fullText.slice(offset, leftOffset) },
                { type: 'address', value: fullText.slice(leftOffset, rightOffset) },
            )
            offset = rightOffset
            list.shift()
        }
        segments.push({ type: 'text', value: fullText.slice(offset) })
        return segments
    }, [addresses, fullText])

    const isClean = addresses.length === 0 || segments.length === 0
    useDirtyDetectionDependency(!isClean, false, fullText)

    if (isClean) return fallback

    return (
        <>
            {segments.map((x, i) =>
                x.type === 'address' ?
                    <AddressTag key={i} address={x.value} text={x.value} />
                :   <Fragment key={i}>{x.value}</Fragment>,
            )}
        </>
    )
})
