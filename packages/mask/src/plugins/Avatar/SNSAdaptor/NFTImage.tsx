import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    imgBackground: {
        position: 'relative',
        margin: theme.spacing(0.5, 1),
        borderRadius: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 24,
        height: 24,
    },
    image: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        borderRadius: '100%',
        boxSizing: 'border-box',
        '&:hover': {
            border: `4px solid ${theme.palette.primary.main}`,
        },
    },
    selected: {
        border: `4px solid ${theme.palette.primary.main}`,
    },
}))

interface NFTImageProps {
    token: NonFungibleToken<ChainId, SchemaType.ERC721>
    selectedToken?: NonFungibleToken<ChainId, SchemaType.ERC721>
    onChange: (token: NonFungibleToken<ChainId, SchemaType.ERC721>) => void
}

function isSameNFT(a: NonFungibleToken<ChainId, SchemaType.ERC721>, b?: NonFungibleToken<ChainId, SchemaType.ERC721>) {
    return isSameAddress(a.address, b?.address) && a.chainId === b?.chainId && a.tokenId === b?.tokenId
}

export function NFTImage(props: NFTImageProps) {
    const { token, onChange, selectedToken } = props
    const { classes } = useStyles()

    return (
        <div className={classes.imgBackground}>
            <img
                onClick={() => onChange(token)}
                src={token.metadata?.imageURL}
                className={classNames(classes.image, isSameNFT(token, selectedToken) ? classes.selected : '')}
            />
        </div>
    )
}
