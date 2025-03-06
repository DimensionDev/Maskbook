import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { makeStyles, ShadowRootPopper } from '@masknet/theme'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { isValidAddress as isSolAddress } from '@masknet/web3-shared-solana'
import { useQuery } from '@tanstack/react-query'
import { Fragment, memo, useMemo } from 'react'
import { EVM_ADDRESS, SOLANA_ADDRESS } from '../../constants.js'
import { PluginScamRPC } from '../../messages.js'
import { usePopoverControl } from './usePopoverControl.js'
import { WarningCard } from './WarningCard.js'

const useStyles = makeStyles()({
    text: {
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

type TextModifierProps = PropsOf<Plugin.SiteAdaptor.Definition['TextModifier']>

interface AddressTagProps {
    address: string
    text: string
}

const AddressTag = memo<AddressTagProps>(function AddressTag({ address, text }) {
    const { classes } = useStyles()
    const { open, anchorEl, iconRef, onMouseEnter, onMouseLeave } = usePopoverControl()
    const { data: isScam } = useQuery({
        queryKey: ['detect-address', address],
        queryFn: () => {
            if (isValidAddress(address)) return PluginScamRPC.checkAddress(address)
            if (isSolAddress(address)) return false
            return false
        },
    })
    if (!isScam) return text
    return (
        <span className={classes.text}>
            <Icons.Danger
                size={18}
                className={classes.icon}
                ref={iconRef}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            />
            {address}
            <ShadowRootPopper open={open} anchorEl={anchorEl}>
                <WarningCard
                    address={address}
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
    const addresses = useMemo(() => {
        const evmAddresses = fullText.match(EVM_ADDRESS) || []
        const solAddresses = fullText.match(SOLANA_ADDRESS) || []
        return [...evmAddresses, ...solAddresses]
    }, [fullText])

    const segments = useMemo(() => {
        let leftOffset = 0
        let rightOffset = 0
        let offset = 0
        let address = ''
        let padding = '' // leading padding
        const segments: Segment[] = []
        const list = [...addresses]
        while (list.length) {
            address = list[0]
            const index = fullText.indexOf(list[0], leftOffset)
            if (index === -1) continue

            padding = address.startsWith(' ') ? ' ' : ''
            leftOffset = index + padding.length
            rightOffset = index + address.length
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

    if (addresses.length === 0 || segments.length === 0) return fallback

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
