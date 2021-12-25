import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import { useI18N } from '../../../utils'
import { GeneralAsset, PageTags } from '../types'
import type { AddressName } from '@masknet/web3-shared-evm'
import type { Dao_Payload } from './hooks'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    hidden: {
        display: 'none',
    },
    button: {
        border: `1px solid ${theme.palette.text.primary} !important`,
        color: theme.palette.text.primary,
        borderRadius: 9999,
    },
    selected: {
        border: `1px solid ${theme.palette.primary.main} !important`,
        color: theme.palette.primary.main,
        borderRadius: 9999,
    },
    connectRSS3: {
        position: 'absolute',
        right: '16px',
        boxSizing: 'border-box',
        height: 36,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 9999,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        border: '0px solid',
        backgroundColor: theme.palette.primary.main,
        color: 'rgb(255, 255, 255)',
        cursor: 'pointer',
    },
}))

export interface PageTagProps {
    tag?: PageTags
    daoPayload?: Dao_Payload
    donations?: GeneralAsset[]
    footprints?: GeneralAsset[]
    addressNFTs?: AddressName
    addressRSS3?: AddressName
    onChange: (tag: PageTags) => void
}

export function PageTag(props: PageTagProps) {
    const { tag, daoPayload, donations, footprints, addressNFTs, addressRSS3, onChange } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    if (!tag) return null

    return (
        <div className={classes.root}>
            <Button
                variant="outlined"
                className={classNames(classes.hidden, tag === PageTags.WalletTag ? classes.selected : classes.button)}
                onClick={() => onChange(PageTags.WalletTag)}
                size="medium">
                {t('wallets')}
            </Button>
            {addressNFTs ? (
                <Button
                    variant="outlined"
                    className={tag === PageTags.NFTTag ? classes.selected : classes.button}
                    onClick={() => onChange(PageTags.NFTTag)}
                    size="medium">
                    {t('nfts')}
                </Button>
            ) : null}
            {donations?.length ? (
                <Button
                    variant="outlined"
                    className={tag === PageTags.DonationTag ? classes.selected : classes.button}
                    onClick={() => onChange(PageTags.DonationTag)}
                    size="medium">
                    {t('donations')}
                </Button>
            ) : null}
            {footprints?.length ? (
                <Button
                    variant="outlined"
                    className={classNames(classes.button, tag === PageTags.FootprintTag ? classes.selected : '')}
                    onClick={() => onChange(PageTags.FootprintTag)}
                    size="medium">
                    Footprints
                </Button>
            ) : null}
            {daoPayload ? (
                <Button
                    variant="outlined"
                    className={tag === PageTags.DAOTag ? classes.selected : classes.button}
                    onClick={() => onChange(PageTags.DAOTag)}
                    size="medium">
                    {t('dao')}
                </Button>
            ) : null}
        </div>
    )
}
