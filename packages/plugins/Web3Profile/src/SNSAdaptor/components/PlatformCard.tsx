import { Stack, Card, Typography, Divider } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { PlatformAvatar } from './PlatformAvatar'

import { useI18N } from '../../locales'
import type { accountType } from '../types'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { ArrowIcon } from '../assets/arrow'
const DEFAULT_PLACEHOLDER = '--'

const useStyles = makeStyles()((theme) => {
    console.log({ theme })
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
        arrowIcon: {
            alignSelf: 'center',
            color: theme.palette.maskColor.second,
            width: 24,
            height: 24,
        },
        currentTag: {
            width: '46px',
            height: '16px',
            fontSize: '12px',
            fontWeight: 700,
            alignSelf: 'center',
            borderRadius: '8px',
            backgroundColor: 'rgba(28, 104, 243, 0.1)',
            color: '#1c68f3',
            padding: '0px 6px 2px 6px',
            marginLeft: '4px',
        },
    }
})

export interface PlatformCardProps extends withClasses<never | 'root'> {
    account?: accountType
    openImageSetting: (str: string) => void
    isCurrent?: boolean
    currentPersona?: IdentityResolved
}

export function PlatformCard(props: PlatformCardProps) {
    const { account, openImageSetting, isCurrent, currentPersona } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Card className={classes.wrapper}>
            <Stack height="100%" spacing={1} divider={<Divider className={classes.divider} />}>
                <div className={classes.flexItem}>
                    <div style={{ display: 'flex' }}>
                        <PlatformAvatar
                            networkIcon={isCurrent ? currentPersona?.avatar : account?.linkedProfile?.avatar}
                            providerIcon={new URL('../assets/twitter.png', import.meta.url)}
                            size={36}
                        />
                        <div style={{ marginLeft: '20px' }}>
                            <Typography style={{ fontSize: '14px', fontWeight: '700', display: 'flex' }}>
                                {isCurrent
                                    ? currentPersona?.nickname
                                    : account?.linkedProfile?.nickname || DEFAULT_PLACEHOLDER}
                                {isCurrent && <Typography className={classes.currentTag}>{t.current()}</Typography>}
                            </Typography>
                            <Typography>@{account?.identity}</Typography>
                        </div>
                    </div>
                </div>
                <div className={classes.flexItem} onClick={() => openImageSetting('NFTs')}>
                    <div>
                        <Typography style={{ fontWeight: '700' }}>{t.NFTs()}</Typography>
                        <Typography>
                            <span style={{ fontWeight: '700' }}>{account?.walletList?.NFTs?.length ?? 0}</span>{' '}
                            {t.wallets()}{' '}
                            <span style={{ fontWeight: '700' }}>
                                {account?.walletList?.NFTs?.reduce(
                                    (pre, cur) =>
                                        pre +
                                        (cur?.collections?.filter((collection) => !collection?.hidden)?.length ?? 0),
                                    0,
                                ) ?? 0}
                            </span>{' '}
                            {t.NFTs()}
                        </Typography>
                    </div>
                    <ArrowIcon className={classes.arrowIcon} />
                </div>
                <div className={classes.flexItem} onClick={() => openImageSetting('Footprints')}>
                    <div>
                        <Typography style={{ fontWeight: '700' }}>{t.footprints()}</Typography>
                        <Typography>
                            <span style={{ fontWeight: '700' }}>{account?.walletList?.footprints?.length ?? 0}</span>{' '}
                            {t.wallets()}{' '}
                            <span style={{ fontWeight: '700' }}>
                                {account?.walletList?.footprints?.reduce(
                                    (pre, cur) =>
                                        pre +
                                        (cur?.collections?.filter((collection) => !collection?.hidden)?.length ?? 0),
                                    0,
                                ) ?? 0}
                            </span>{' '}
                            {t.footprints()}
                        </Typography>
                    </div>
                    <ArrowIcon className={classes.arrowIcon} />
                </div>
                <div className={classes.flexItem} onClick={() => openImageSetting('Donations')}>
                    <div>
                        <Typography style={{ fontWeight: '700' }}>{t.donations()}</Typography>
                        <Typography>
                            <span style={{ fontWeight: '700' }}>{account?.walletList?.donations?.length ?? 0}</span>{' '}
                            {t.wallets()}{' '}
                            <span style={{ fontWeight: '700' }}>
                                {account?.walletList?.donations?.reduce(
                                    (pre, cur) =>
                                        pre +
                                        (cur?.collections?.filter((collection) => !collection?.hidden)?.length ?? 0),
                                    0,
                                ) ?? 0}
                            </span>{' '}
                            {t.donations()}
                        </Typography>
                    </div>
                    <ArrowIcon className={classes.arrowIcon} />
                </div>
            </Stack>
        </Card>
    )
}
