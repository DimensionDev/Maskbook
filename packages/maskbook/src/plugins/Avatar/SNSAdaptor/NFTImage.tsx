import { makeStyles } from '@masknet/theme'
import { ERC721TokenDetailed, isSameAddress } from '@masknet/web3-shared-evm'
import classNames from 'classnames'

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
    token: ERC721TokenDetailed
    selectedToken?: ERC721TokenDetailed
    onChange: (token: ERC721TokenDetailed) => void
}

function isSameNFT(a: ERC721TokenDetailed, b?: ERC721TokenDetailed) {
    return (
        isSameAddress(a.contractDetailed.address, b?.contractDetailed.address) &&
        a.contractDetailed.chainId === b?.contractDetailed.chainId &&
        a.tokenId === b?.tokenId
    )
}

export function NFTImage(props: NFTImageProps) {
    const { token, onChange, selectedToken } = props
    const { classes } = useStyles()

    return (
        <div className={classes.imgBackground}>
            <img
                onClick={() => onChange(token)}
                src={token.info.image}
                className={classNames(classes.image, isSameNFT(token, selectedToken) ? classes.selected : '')}
            />
        </div>
    )
}
