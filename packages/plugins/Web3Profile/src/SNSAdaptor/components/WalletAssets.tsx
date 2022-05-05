import { Card, Typography, Link, Box } from '@mui/material'
import { LinkOutIcon } from '@masknet/icons'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../locales'
import { ImageIcon } from './ImageIcon'
import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import type { collectionTypes } from '../types'
import { ChainId } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => {
    console.log({ theme })
    return {
        wrapper: {},

        walletInfo: {
            display: 'flex',
            alignItems: 'center',
        },
        walletName: {
            fontSize: '16px',
            fontWeight: 400,
            marginLeft: '4px',
        },
        collectionWrap: {
            width: '90px',
            height: '90px',
            marginTop: '12px',
            marginRight: '5px',
            border: `1px solid ${theme.palette.divider}`,
            background: 'rgba(229,232,235,1)',
            cursor: 'pointer',
            '&:nth-child(5n)': {
                marginRight: 0,
            },
        },
        link: {
            cursor: 'pointer',
            lineHeight: '10px',
            marginTop: 2,
            '&:hover': {
                textDecoration: 'none',
            },
        },
        linkIcon: {
            fill: 'none',
            width: 14,
            height: 14,
            marginLeft: theme.spacing(0.5),
        },
    }
})

export interface WalletAssetsCardProps extends withClasses<never | 'root'> {
    networkIcon?: URL
    address: string
    onSetting: () => void
    type: string
    collectionList?: collectionTypes[]
}

export function WalletAssetsCard(props: WalletAssetsCardProps) {
    // const { avatar, nickName = 'unknown', platformId = 'unknown', isCurrent = false, openImageSetting } = props
    const { networkIcon, address, onSetting, type, collectionList } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const chainId = ChainId.Mainnet

    const { Utils } = useWeb3State()
    const { value: domain } = useReverseAddress(address)

    return (
        <Card className={classes.wrapper}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={classes.walletInfo}>
                        <ImageIcon
                            icon={new URL('../assets/ethereum.png', import.meta.url)}
                            size={20}
                            borderRadius="0"
                        />
                        <Typography className={classes.walletName}>{domain || address}</Typography>
                        <Link
                            className={classes.link}
                            href={address ? Utils?.resolveAddressLink?.(chainId, address) ?? '' : ''}
                            target="_blank"
                            rel="noopener noreferrer">
                            <LinkOutIcon className={classes.linkIcon} />
                        </Link>
                    </div>
                    <div onClick={() => onSetting()}>
                        <ImageIcon size={20} icon={new URL('../assets/settingIcon.png', import.meta.url)} />
                    </div>
                </div>
            </div>

            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {collectionList
                    ?.filter((collection) => !collection?.hidden)
                    ?.slice(0, 10)
                    ?.map((collection, i) => (
                        <div
                            key={i}
                            className={classes.collectionWrap}
                            style={{ borderRadius: type === 'Donations' ? '50%' : '12px' }}>
                            <ImageIcon
                                size={89}
                                borderRadius={type === 'Donations' ? '50%' : '12px'}
                                icon={collection?.iconURL}
                            />
                        </div>
                    ))}
            </Box>
        </Card>
    )
}
