import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { Link } from '@mui/material'
import type { NFTInfo } from '../types.js'
import { formatPrice, formatText } from '../utils/index.js'
import { NFTAvatarRing } from './NFTAvatarRing.js'
import { useI18N } from '../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

interface NFTBadgeProps extends withClasses<'root' | 'text' | 'icon'> {
    nftInfo?: NFTInfo
    size?: number
    width?: number
    hasRainbow?: boolean
    borderSize?: number
}

export function NFTBadge(props: NFTBadgeProps) {
    const { nftInfo, size = 140, hasRainbow, borderSize } = props
    const { classes } = useStyles(undefined, { props })
    const t = useI18N()

    if (!nftInfo)
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
                    text={t.loading()}
                    price=""
                />
            </div>
        )
    return (
        <div
            className={classes.root}
            onClick={(e) => {
                e.preventDefault()
                if (!nftInfo.permalink) return
                openWindow(nftInfo.permalink)
            }}>
            <Link href={nftInfo?.permalink ?? ''} target="_blank" rel="noopener noreferrer">
                <NFTAvatarRing
                    id="NFTAvatarRing"
                    width={size}
                    strokeWidth={14}
                    stroke="black"
                    hasRainbow={hasRainbow}
                    borderSize={borderSize}
                    fontSize={9}
                    text={formatText(nftInfo.name ?? '', nftInfo.tokenId)}
                    price={formatPrice(nftInfo.amount ?? '0', nftInfo.symbol ?? 'ETH')}
                />
            </Link>
        </div>
    )
}
