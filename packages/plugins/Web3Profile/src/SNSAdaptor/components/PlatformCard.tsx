import { Stack, Card, Typography, Divider } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'

import { useI18N } from '../../locales/index.js'
import type { AccountType } from '../types.js'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { CollectionItem } from './CollectionItem.js'
import { CURRENT_STATUS } from '../../constants.js'
import { PlatformAvatar } from '@masknet/shared'
const DEFAULT_PLACEHOLDER = '--'

const useStyles = makeStyles()((theme) => {
    return {
        wrapper: {
            padding: '16px',
            marginTop: '12px',
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        },
        divider: {
            color: theme.palette.divider,
        },
        flexItem: {
            display: 'flex',
            justifyContent: 'space-between',
            '> div > p': {
                fontSize: '12px',
            },
            ':hover': {
                cursor: 'pointer',
            },
            '&:first-child:hover': {
                cursor: 'default',
            },
        },
        currentTag: {
            width: '46px',
            height: '16px',
            fontSize: '12px',
            fontWeight: 700,
            alignSelf: 'center',
            borderRadius: '8px',
            backgroundColor: 'rgba(28, 104, 243, 0.1)',
            color: theme.palette.maskColor.primary,
            padding: '0px 6px 2px 6px',
            marginLeft: '4px',
        },
    }
})

export interface PlatformCardProps extends withClasses<never | 'root'> {
    account: AccountType
    openImageSetting: (status: CURRENT_STATUS) => void
    isCurrent?: boolean
    currentPersona?: IdentityResolved
}

export function PlatformCard(props: PlatformCardProps) {
    const { account, openImageSetting, isCurrent, currentPersona } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const walletsCount = account.walletList.NFTs.length

    return (
        <Card className={classes.wrapper}>
            <Stack height="100%" spacing={1} divider={<Divider className={classes.divider} />}>
                <div className={classes.flexItem}>
                    <div style={{ display: 'flex' }}>
                        <PlatformAvatar
                            networkIcon={isCurrent ? currentPersona?.avatar : account.linkedProfile?.avatar}
                            providerIcon={new URL('../assets/Twitter.png', import.meta.url)}
                            size={36}
                        />
                        <div style={{ marginLeft: '20px' }}>
                            <Typography style={{ fontSize: '14px', fontWeight: '700', display: 'flex' }}>
                                {isCurrent
                                    ? currentPersona?.nickname
                                    : account.linkedProfile?.nickname || DEFAULT_PLACEHOLDER}
                                {isCurrent && (
                                    <Typography component="span" className={classes.currentTag}>
                                        {t.current()}
                                    </Typography>
                                )}
                            </Typography>
                            <Typography>
                                @{isCurrent ? currentPersona?.identifier?.userId : account.identity}
                            </Typography>
                        </div>
                    </div>
                </div>
                <CollectionItem
                    title={t.NFTs()}
                    onClick={() => openImageSetting(CURRENT_STATUS.NFT_Setting)}
                    walletsNum={walletsCount}
                    collectionNum={account.walletList.NFTs.reduce(
                        (acc, cur) => acc + (cur.collections?.filter((x) => !x?.hidden)?.length ?? 0),
                        0,
                    )}
                />
                <CollectionItem
                    title={t.footprints()}
                    onClick={() => openImageSetting(CURRENT_STATUS.Footprints_setting)}
                    walletsNum={walletsCount}
                    collectionNum={account.walletList.footprints.reduce(
                        (pre, cur) => pre + (cur.collections?.filter((x) => !x?.hidden)?.length ?? 0),
                        0,
                    )}
                />
                <CollectionItem
                    title={t.donations()}
                    onClick={() => openImageSetting(CURRENT_STATUS.Donations_setting)}
                    walletsNum={walletsCount}
                    collectionNum={account.walletList.donations.reduce(
                        (pre, cur) => pre + (cur.collections?.filter((x) => !x?.hidden)?.length ?? 0),
                        0,
                    )}
                />
            </Stack>
        </Card>
    )
}
