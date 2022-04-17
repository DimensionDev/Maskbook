import { Stack, Card, Typography, Divider } from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { PlatformAvatar } from './PlatformAvatar'

import { useI18N } from '../../locales'

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
    avatar?: string
    nickName?: string
    platformId?: string
    isCurrent?: boolean
    openImageSetting: (str: string) => void
}

export function PlatformCard(props: PlatformCardProps) {
    const { avatar, nickName = 'unknown', platformId = 'unknown', isCurrent = false, openImageSetting } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Card className={classes.wrapper}>
            <Stack height="100%" spacing={1} divider={<Divider className={classes.divider} />}>
                <div className={classes.flexItem}>
                    <div style={{ display: 'flex' }}>
                        <PlatformAvatar
                            networkIcon={avatar}
                            providerIcon={avatar ? new URL('../assets/twitter.png', import.meta.url) : undefined}
                            size={36}
                        />
                        <div style={{ marginLeft: '20px' }}>
                            <Typography style={{ fontSize: '14px', fontWeight: '700', display: 'flex' }}>
                                {nickName}
                                {isCurrent && <Typography className={classes.currentTag}>{t.current()}</Typography>}
                            </Typography>
                            <Typography>@{platformId}</Typography>
                        </div>
                    </div>
                    <ArrowForwardIosIcon className={classes.arrowIcon} />
                </div>
                <div className={classes.flexItem} onClick={() => openImageSetting('NFTS')}>
                    <div>
                        <Typography style={{ fontWeight: '700' }}>NFTs</Typography>
                        <Typography>
                            <span style={{ fontWeight: '700' }}>2</span> Wallets{' '}
                            <span style={{ fontWeight: '700' }}>200</span> NFTs
                        </Typography>
                    </div>
                    <ArrowForwardIosIcon className={classes.arrowIcon} />
                </div>
                <div className={classes.flexItem} onClick={() => openImageSetting('Footprints')}>
                    <div>
                        <Typography style={{ fontWeight: '700' }}>Footprints</Typography>
                        <Typography>
                            <span style={{ fontWeight: '700' }}>5</span> Wallets{' '}
                            <span style={{ fontWeight: '700' }}>200</span> NFTs
                        </Typography>
                    </div>
                    <ArrowForwardIosIcon className={classes.arrowIcon} />
                </div>
                <div className={classes.flexItem} onClick={() => openImageSetting('Donations')}>
                    <div>
                        <Typography style={{ fontWeight: '700' }}>Donations</Typography>
                        <Typography>
                            <span style={{ fontWeight: '700' }}>2</span> Wallets{' '}
                            <span style={{ fontWeight: '700' }}>200</span> NFTs
                        </Typography>
                    </div>
                    <ArrowForwardIosIcon className={classes.arrowIcon} />
                </div>
            </Stack>
        </Card>
    )
}
