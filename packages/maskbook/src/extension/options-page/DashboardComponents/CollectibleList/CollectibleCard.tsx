import { Card, createStyles, Link, makeStyles } from '@material-ui/core'
import { Image } from '../../../../components/shared/Image'
import type { WalletRecord } from '../../../../plugins/Wallet/database/types'
import { MaskbookIconOutlined } from '../../../../resources/MaskbookIcon'
import { useI18N } from '../../../../utils/i18n-next-ui'
import type { ERC721TokenDetailed } from '../../../../web3/types'
import { ERC721TokenActionsBar } from '../ERC721TokenActionsBar'

const useStyles = makeStyles((theme) =>
    createStyles({
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
    }),
)

export interface CollectibleCardProps {
    link: string
    wallet: WalletRecord
    token: ERC721TokenDetailed
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, token } = props

    const { t } = useI18N()
    const classes = useStyles(props)

    return (
        <Link target="_blank" rel="noopener noreferrer" href={props.link}>
            <Card className={classes.root} style={{ width: 160, height: 220 }}>
                <ERC721TokenActionsBar classes={{ more: classes.icon }} wallet={wallet} token={token} />
                {token.tokenURI ? (
                    <Image
                        component="img"
                        width={160}
                        height={220}
                        style={{ objectFit: 'contain' }}
                        src={token.tokenURI}
                    />
                ) : (
                    <MaskbookIconOutlined className={classes.placeholder} />
                )}
            </Card>
        </Link>
    )
}
