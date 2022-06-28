import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { SelectedIcon } from '../assets/selected'
import type { AllChainsNonFungibleToken } from '../types'

const useStyles = makeStyles()((theme) => ({
    imgBackground: {
        position: 'relative',
        padding: 6,
        borderRadius: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        position: 'absolute',
        top: 8,
        right: 13,
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
    pluginId: NetworkPluginID
    showBadge?: boolean
    token: AllChainsNonFungibleToken
    selectedToken?: AllChainsNonFungibleToken
    onChange: (token: AllChainsNonFungibleToken) => void
}

function isSameNFT(pluginId: NetworkPluginID, a: AllChainsNonFungibleToken, b?: AllChainsNonFungibleToken) {
    return pluginId !== NetworkPluginID.PLUGIN_SOLANA
        ? isSameAddress(a.contract?.address, b?.contract?.address) &&
              a.contract?.chainId &&
              a.contract?.chainId === b?.contract?.chainId &&
              a.tokenId === b?.tokenId
        : a.tokenId === b?.tokenId
}

export function NFTImage(props: NFTImageProps) {
    const { token, onChange, selectedToken, showBadge = false, pluginId } = props
    const { classes } = useStyles()

    return (
        <div className={classes.imgBackground}>
            <img
                onClick={() => onChange(token)}
                src={token.metadata?.imageURL}
                className={classNames(classes.image, isSameNFT(pluginId, token, selectedToken) ? classes.selected : '')}
            />
            {showBadge && isSameNFT(pluginId, token, selectedToken) ? <SelectedIcon className={classes.icon} /> : null}
        </div>
    )
}
