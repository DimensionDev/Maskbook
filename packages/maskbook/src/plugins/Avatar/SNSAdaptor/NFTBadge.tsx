import { UnionIcon } from '@masknet/icons'
import { useStylesExtends } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { resolveOpenSeaLink } from '@masknet/web3-shared'
import { CircularProgress, Link, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useNFT } from '../hooks'
import type { AvatarMetaDB } from '../types'

const useStyles = makeStyles()({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 8,
    },
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    icon: {
        width: 12,
        height: 12,
        transform: 'translate(0px, 2px)',
    },
    text: {
        paddingLeft: 4,
        paddingRight: 4,
        fontSize: 10,
        whiteSpace: 'nowrap',
        margin: 0,
        color: 'white',
        textShadow:
            '1px 1px black, 1px 0px black, 0px 1px black, -1px 0px black, 0px -1px black, -1px -1px black, 1px -1px black, -1px 1px black',
    },
    link: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        AlignJustify: 'center',
    },
    box: {
        background:
            'linear-gradient(106.15deg, #FF0000 5.97%, #FF8A00 21.54%, #FFC700 42.35%, #52FF00 56.58%, #00FFFF 73.01%, #0038FF 87.8%, #AD00FF 101.49%, #FF0000 110.25%)',
        borderRadius: 4,
    },
    loading: {
        width: 64,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    nft: {
        marginTop: 20,
    },
})

interface NFTBadgeProps extends withClasses<'root' | 'text' | 'icon'> {
    avatar: AvatarMetaDB
    size?: number
}

function formatPrice(amount: string) {
    const _amount = new BigNumber(amount ?? '0')
    if (_amount.isZero()) return '0'
    if (_amount.isLessThan(1)) return _amount.toFixed(2)
    if (_amount.isLessThan(1e3)) return _amount.toFixed(1)
    if (_amount.isLessThan(1e6)) return `${_amount.div(1e6).toFixed(1)}K`
    return `${_amount.div(1e6).toFixed(1)}M`
}

function formatText(symbol: string, length: number) {
    return symbol.length > length ? `${symbol.slice(0, length)}...` : symbol
}

export function NFTBadge(props: NFTBadgeProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { avatar, size = 18 } = props

    const { value = { amount: '0', symbol: 'ETH', name: '' }, loading } = useNFT(
        avatar.userId,
        avatar.address,
        avatar.tokenId,
    )
    const { amount, symbol, name } = value

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
                <div className={classes.wrapper}>
                    {loading ? (
                        <div className={classNames(classes.loading, classes.box)}>
                            <CircularProgress size={size} />
                        </div>
                    ) : (
                        <ShowPrice
                            name={formatText(name ?? '', 13)}
                            price={formatPrice(amount)}
                            symbol={formatText(symbol, 4)}
                            tokenId={formatText(avatar.tokenId, 6)}
                        />
                    )}
                </div>
            </Link>
        </div>
    )
}

interface ShowPriceProps {
    price: string
    symbol: string
    name: string
    tokenId: string
}

function ShowPrice({ name, symbol, tokenId, price }: ShowPriceProps) {
    const { classes } = useStyles()
    const text = (str: string, showIcon = false) => (
        <div className={classes.box}>
            <Typography className={classes.text}>
                {str}
                {showIcon ? <UnionIcon className={classes.icon} /> : null}
            </Typography>
        </div>
    )

    return (
        <>
            {symbol && name && price !== '0' ? (
                <>
                    {text(`${name}`)} {text(`${price} ${symbol}`, true)}
                </>
            ) : !symbol && !name && price !== '0' ? (
                <>
                    {text('NFT', true)} {text(`${price} ${symbol}`)}
                </>
            ) : symbol && name && price === '0' ? (
                <>
                    {text(`${name}`)} {text('NFT', true)}
                </>
            ) : symbol && !name && price !== '0' ? (
                <>
                    {text('NFT', true)} {text(`${price} ${symbol}`)}
                </>
            ) : (
                <div className={classes.nft}> {text('NFT', true)}</div>
            )}
        </>
    )
}
