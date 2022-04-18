import { Web3Plugin, useWeb3State } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
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
    token: Web3Plugin.NonFungibleAsset
    selectedToken?: Web3Plugin.NonFungibleAsset
    onChange: (token: Web3Plugin.NonFungibleAsset) => void
}

export function NFTImage(props: NFTImageProps) {
    const { token, onChange, selectedToken } = props
    const { classes } = useStyles()
    const { Utils } = useWeb3State()

    const isSameNFT = (a: Web3Plugin.NonFungibleAsset, b?: Web3Plugin.NonFungibleAsset) => {
        return (
            Utils?.isSameAddress?.(a.contract?.address, b?.contract?.address) &&
            a.contract?.chainId === b?.contract?.chainId &&
            a.tokenId === b?.tokenId
        )
    }

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
