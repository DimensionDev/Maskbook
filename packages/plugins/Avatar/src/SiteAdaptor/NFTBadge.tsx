import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { Link } from '@mui/material'
import { formatPrice, formatText } from '../utils/index.js'
import { NFTAvatarRing } from './NFTAvatarRing.js'
import type { AvatarToken } from '@masknet/web3-providers/types'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

interface NFTBadgeProps extends withClasses<'root' | 'text' | 'icon'> {
    token: AvatarToken | null
    size?: number
    width?: number
    hasRainbow?: boolean
    borderSize?: number
}

export function NFTBadge(props: NFTBadgeProps) {
    const { _ } = useLingui()
    const { token, size = 140, hasRainbow, borderSize } = props
    const { classes } = useStyles(undefined, { props })

    if (!token)
        return (
            <div className={classes.root}>
                <NFTAvatarRing
                    id="NFTAvatarRing"
                    width={size}
                    strokeWidth={14}
                    stroke="black"
                    hasRainbow={hasRainbow}
                    borderSize={borderSize}
                    fontSize={9}
                    text={_(msg`Loading...`)}
                    price=""
                />
            </div>
        )

    return (
        <div
            className={classes.root}
            onClick={(e) => {
                e.preventDefault()
                if (token.permalink) openWindow(token.permalink)
            }}>
            <Link href={token?.permalink ?? ''} target="_blank" rel="noopener noreferrer">
                <NFTAvatarRing
                    id="NFTAvatarRing"
                    width={size}
                    strokeWidth={14}
                    stroke="black"
                    hasRainbow={hasRainbow}
                    borderSize={borderSize}
                    fontSize={9}
                    text={formatText(token.name ?? '', token.tokenId)}
                    price={formatPrice(token.amount ?? '0', token.symbol ?? 'ETH')}
                />
            </Link>
        </div>
    )
}
