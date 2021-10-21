import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import classNames from 'classnames'
import { PageTags } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        '>:nth-child(2)': {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
        },
    },
    button: {
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(237, 241, 242, 1)' : 'rgba(47, 51, 54, 1)'}`,
        borderRadius: 9999,
        color: theme.palette.mode === 'dark' ? 'rgba(239, 243, 244, 1)' : 'rgba(17, 20, 24, 1) ',
    },
    selected: {
        border: '1px solid rgba(28, 104, 243, 1)',
        color: 'rgba(28, 104, 243, 1)',
    },
    hidden: {
        display: 'none',
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
                className={classNames(
                    classes.hidden,
                    classes.button,
                    tag === PageTags.WalletTag ? classes.selected : '',
                )}
                onClick={() => onChange(PageTags.WalletTag)}
                size="medium">
                Wallets
            </Button>
            <Button
                className={classNames(classes.button, tag === PageTags.NFTTag ? classes.selected : '')}
                onClick={() => onChange(PageTags.NFTTag)}
                size="medium">
                NFTs
            </Button>
            <Button
                className={classNames(
                    classes.hidden,
                    classes.button,
                    tag === PageTags.DonationTag ? classes.selected : '',
                )}
                onClick={() => onChange(PageTags.DonationTag)}
                size="medium">
                Donations
            </Button>
        </div>
    )
}
