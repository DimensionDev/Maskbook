import { NFTAvatarAmountIcon } from '@masknet/icons'
import { useStylesExtends } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { resolveOpenSeaLink } from '@masknet/web3-shared'
import { CircularProgress, Link, Typography } from '@material-ui/core'
import { useEffect, useState } from 'react'
import { AvatarMetaDB, useNFT } from './NFTAvatar'

const useStyles = makeStyles()({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        top: 46,
        right: 0,
    },
    wrapper: {
        background:
            'linear-gradient(106.15deg, #FF0000 5.97%, #FF8A00 21.54%, #FFC700 42.35%, #52FF00 56.58%, #00FFFF 73.01%, #0038FF 87.8%, #AD00FF 101.49%, #FF0000 110.25%)',
        borderRadius: 3,
        minWidth: 43,
        width: 'auto',
        display: 'flex',
        justifyContent: 'center',
    },
    icon: {
        width: 28,
        height: 11,
    },
    text: {
        fontSize: 10,
        transform: 'scale(0.8)',
        margin: 0,
        color: 'white',
        whiteSpace: 'nowrap',
        textShadow:
            '1px 1px black, 1px 0px black, 0px 1px black, -1px 0px black, 0px -1px black, -1px -1px black, 1px -1px black, -1px 1px black',
        lineHeight: 1,
        textDecoration: 'none',
    },
    link: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        AlignJustify: 'center',
    },
})

interface NFTBadgeProps extends withClasses<'root' | 'text' | 'icon'> {
    avatar: AvatarMetaDB
    size?: number
}
export function NFTBadge(props: NFTBadgeProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { avatar, size = 10 } = props

    const [amount_, setAmount_] = useState('0')
    const [symbol_, setSymbol_] = useState('')
    const { value = { amount: '0', symbol: 'ETH' }, loading } = useNFT(avatar.userId, avatar.address, avatar.tokenId)

    const { amount, symbol } = value
    useEffect(() => {
        setAmount_(amount)
    }, [amount])

    useEffect(() => {
        setSymbol_(symbol)
    }, [symbol])

    return (
        <div
            className={classes.root}
            onClick={(e) => {
                e.preventDefault()
                window.open(resolveOpenSeaLink(avatar.address, avatar.tokenId), '_blank')
            }}>
            <Link
                underline="none"
                className={classes.link}
                title={resolveOpenSeaLink(avatar.address, avatar.tokenId)}
                href={resolveOpenSeaLink(avatar.address, avatar.tokenId)}
                target="_blank"
                rel="noopener noreferrer">
                <NFTAvatarAmountIcon className={classes.icon} />
                <div className={classes.wrapper}>
                    <Typography className={classes.text}>
                        {loading ? <CircularProgress size={size} /> : `${amount_} ${symbol_}`}
                    </Typography>
                </div>
            </Link>
        </div>
    )
}
