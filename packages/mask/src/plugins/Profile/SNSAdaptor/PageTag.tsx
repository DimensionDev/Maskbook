import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import classNames from 'classnames'
import { PageTags } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    button: {
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(237, 241, 242, 1)' : 'rgba(47, 51, 54, 1)'}`,
        borderRadius: 9999,
        color: theme.palette.mode === 'dark' ? 'rgba(239, 243, 244, 1)' : 'rgba(17, 20, 24, 1) ',
    },
    selected: {
        border: `1px solid ${theme.palette.primary.main}`,
        color: theme.palette.primary.main,
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
        border: '1px solid',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
        color: theme.palette.mode === 'dark' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
        cursor: 'pointer',
    },
}))

interface PageTagProps {
    onChange: (tag: PageTags) => void
    tag: PageTags
}

export function PageTag(props: PageTagProps) {
    const { classes } = useStyles()
    const { onChange, tag } = props
    return (
        <div className={classes.root}>
            <Button
                variant="outlined"
                className={classNames(classes.button, tag === PageTags.WalletTag ? classes.selected : '')}
                onClick={() => onChange(PageTags.WalletTag)}
                size="medium">
                Wallets
            </Button>
            <Button
                variant="outlined"
                className={classNames(classes.button, tag === PageTags.NFTTag ? classes.selected : '')}
                onClick={() => onChange(PageTags.NFTTag)}
                size="medium">
                NFTs
            </Button>
            <Button
                variant="outlined"
                className={classNames(classes.button, tag === PageTags.DonationTag ? classes.selected : '')}
                onClick={() => onChange(PageTags.DonationTag)}
                size="medium">
                Donations
            </Button>
            <Button
                variant="outlined"
                className={classNames(classes.button, tag === PageTags.FootprintTag ? classes.selected : '')}
                onClick={() => onChange(PageTags.FootprintTag)}
                size="medium">
                Footprints
            </Button>
            <div className={classes.connectRSS3} onClick={() => onChange(PageTags.ConnectRSS3)}>
                Connect RSS3
            </div>
        </div>
    )
}
