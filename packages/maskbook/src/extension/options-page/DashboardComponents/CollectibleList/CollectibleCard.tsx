import { Card, Link, makeStyles } from '@material-ui/core'
import { Wallet, useChainId, ERC1155TokenAssetDetailed, ERC721TokenAssetDetailed } from '@masknet/web3-shared'
import { Image } from '../../../../components/shared/Image'
import { resolveCollectibleLink } from '../../../../plugins/Wallet/pipes'
import type { CollectibleProvider } from '../../../../plugins/Wallet/types'
import { MaskbookIconOutlined } from '../../../../resources/MaskbookIcon'
import { ActionsBarNFT } from '../ActionsBarNFT'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
    },
    icon: {
        top: theme.spacing(1),
        right: theme.spacing(1),
        position: 'absolute',
        zIndex: 1,
        backgroundColor: `${theme.palette.background.paper} !important`,
    },
    placeholder: {
        width: 64,
        height: 64,
        opacity: 0.1,
    },
}))

export interface CollectibleCardProps {
    provider: CollectibleProvider
    wallet: Wallet
    token: ERC721TokenAssetDetailed | ERC1155TokenAssetDetailed
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, token, provider } = props
    const classes = useStyles(props)
    const chainId = useChainId()

    return (
        <Link target="_blank" rel="noopener noreferrer" href={resolveCollectibleLink(chainId, provider, token)}>
            <Card className={classes.root} style={{ width: 160, height: 220 }}>
                <ActionsBarNFT classes={{ more: classes.icon }} wallet={wallet} token={token} />
                {token.asset?.image ? (
                    <Image
                        component="img"
                        width={160}
                        height={220}
                        style={{ objectFit: 'contain' }}
                        src={token.asset.image}
                    />
                ) : (
                    <MaskbookIconOutlined className={classes.placeholder} />
                )}
            </Card>
        </Link>
    )
}
