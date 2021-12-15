import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import classNames from 'classnames'
import { useI18N } from '../../../utils'
import { PageTags } from '../types'
import { useDonations, useFootprints, Dao_Payload } from './hooks'

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

interface PageTagProps {
    tag: PageTags
    isOwned: boolean
    daoPayload: Dao_Payload | undefined
    onChange: (tag: PageTags) => void
}

export function PageTag(props: PageTagProps) {
    const { classes } = useStyles()
    const { onChange, tag, isOwned, daoPayload } = props
    const { t } = useI18N()

    const { donations } = useDonations()
    const { footprints } = useFootprints()
    const hasDonations = donations.length > 0
    const hasFootprints = footprints.length > 0

    return (
        <div className={classes.root}>
            <Button
                variant="outlined"
                className={classNames(classes.hidden, tag === PageTags.WalletTag ? classes.selected : classes.button)}
                onClick={() => onChange(PageTags.WalletTag)}
                size="medium">
                {t('wallets')}
            </Button>
            <Button
                variant="outlined"
                className={tag === PageTags.NFTTag ? classes.selected : classes.button}
                onClick={() => onChange(PageTags.NFTTag)}
                size="medium">
                {t('nfts')}
            </Button>
            {hasDonations ? (
                <Button
                    variant="outlined"
                    className={tag === PageTags.DonationTag ? classes.selected : classes.button}
                    onClick={() => onChange(PageTags.DonationTag)}
                    size="medium">
                    {t('donations')}
                </Button>
            ) : null}
            {hasFootprints ? (
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
            {isOwned ? (
                <Button
                    variant="contained"
                    className={classes.connectRSS3}
                    onClick={() => onChange(PageTags.ConnectRSS3)}>
                    Connect RSS3
                </Button>
            ) : null}
        </div>
    )
}
