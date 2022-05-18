import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { SelectedIcon } from '../assets/selected'

const useStyles = makeStyles()((theme) => ({
    imgBackground: {
        position: 'relative',
        margin: theme.spacing(1.25, 1, 1.25, 1.5),
        borderRadius: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 20,
        height: 20,
        color: theme.palette.primary.main,
    },
    image: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        borderRadius: '100%',
        boxSizing: 'border-box',
        '&:hover': {
            border: `1px solid ${theme.palette.primary.main}`,
        },
    },
    selected: {
        border: `1px solid ${theme.palette.primary.main}`,
    },
}))

interface NFTImageProps {
    showBadge?: boolean
    token: NonFungibleToken<ChainId, SchemaType>
    selectedToken?: NonFungibleToken<ChainId, SchemaType>
    onChange: (token: NonFungibleToken<ChainId, SchemaType>) => void
}

function isSameNFT(a: NonFungibleToken<ChainId, SchemaType>, b?: NonFungibleToken<ChainId, SchemaType>) {
    return isSameAddress(a.address, b?.address) && a.chainId === b?.chainId && a.tokenId === b?.tokenId
}

export function NFTImage(props: NFTImageProps) {
    const { token, onChange, selectedToken, showBadge = false } = props
    const { classes } = useStyles()

    return (
        <div className={classes.imgBackground}>
            <img
                onClick={() => onChange(token)}
                src={token.metadata?.imageURL}
                className={classNames(classes.image, isSameNFT(token, selectedToken) ? classes.selected : '')}
            />
            {showBadge && isSameNFT(token, selectedToken) ? <SelectedIcon className={classes.icon} /> : null}
        </div>
    )
}
