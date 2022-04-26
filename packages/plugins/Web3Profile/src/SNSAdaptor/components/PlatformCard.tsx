import { Stack, Card, Typography, Divider } from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { PlatformAvatar } from './PlatformAvatar'

import { useI18N } from '../../locales'
import type { accountType } from '../types'

const useStyles = makeStyles()((theme) => {
    console.log({ theme })
    return {
        wrapper: {
            border: `1px solid ${theme.palette.divider}`,
            padding: '16px',
            marginBottom: '12px',
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
            color: theme.palette.grey[700],
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
    footprintNum?: number
    donationNum?: number
    isCurrent?: boolean
}

export function PlatformCard(props: PlatformCardProps) {
    const { account, openImageSetting, footprintNum, donationNum, isCurrent } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Card className={classes.wrapper}>
            <Stack height="100%" spacing={1} divider={<Divider className={classes.divider} />}>
                <div className={classes.flexItem}>
                    <div style={{ display: 'flex' }}>
                        <PlatformAvatar providerIcon={new URL('../assets/twitter.png', import.meta.url)} size={36} />
                        <div style={{ marginLeft: '20px' }}>
                            <Typography style={{ fontSize: '14px', fontWeight: '700', display: 'flex' }}>
                                kk
                                {isCurrent && <Typography className={classes.currentTag}>{t.current()}</Typography>}
                            </Typography>
                            <Typography>@{account?.identity}</Typography>
                        </div>
                    </div>
                </div>
                <div className={classes.flexItem} onClick={() => openImageSetting('NFTS')}>
                    <div>
                        <Typography style={{ fontWeight: '700' }}>{t.NFTs()}</Typography>
                        <Typography>
                            <span style={{ fontWeight: '700' }}>{account?.walletList?.NFTs?.length}</span> {t.wallets()}{' '}
                            <span style={{ fontWeight: '700' }}>{0}</span> {t.NFTs()}
                        </Typography>
                    </div>
                    <ArrowForwardIosIcon className={classes.arrowIcon} />
                </div>
                <div className={classes.flexItem} onClick={() => openImageSetting('Footprints')}>
                    <div>
                        <Typography style={{ fontWeight: '700' }}>{t.footprints()}</Typography>
                        <Typography>
                            <span style={{ fontWeight: '700' }}>{account?.walletList?.footprints?.length}</span>{' '}
                            {t.wallets()} <span style={{ fontWeight: '700' }}>{footprintNum ?? 0}</span>{' '}
                            {t.footprints()}
                        </Typography>
                    </div>
                    <ArrowForwardIosIcon className={classes.arrowIcon} />
                </div>
                <div className={classes.flexItem} onClick={() => openImageSetting('Donations')}>
                    <div>
                        <Typography style={{ fontWeight: '700' }}>{t.donations()}</Typography>
                        <Typography>
                            <span style={{ fontWeight: '700' }}>{account?.walletList?.donations?.length}</span>{' '}
                            {t.wallets()} <span style={{ fontWeight: '700' }}>{donationNum ?? 0}</span> {t.donations()}
                        </Typography>
                    </div>
                    <ArrowForwardIosIcon className={classes.arrowIcon} />
                </div>
            </Stack>
        </Card>
    )
}
