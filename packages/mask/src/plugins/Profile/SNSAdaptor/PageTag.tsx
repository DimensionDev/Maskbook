import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import classNames from 'classnames'
import { PageTags } from '../types'
import type { Dao_Payload } from './hooks/useDao'

const useStyles = makeStyles()((theme) => ({
    root: {
        '>:nth-child(2)': {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
        },
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
    hidden: {
        display: 'none',
    },
}))

interface PageTagProps {
    tag: PageTags
    daoPayload: Dao_Payload | undefined
    onChange: (tag: PageTags) => void
}

export function PageTag(props: PageTagProps) {
    const { classes } = useStyles()
    const { onChange, tag, daoPayload } = props
    return (
        <div className={classes.root}>
            <Button
                variant="outlined"
                className={classNames(classes.hidden, tag === PageTags.WalletTag ? classes.selected : classes.button)}
                onClick={() => onChange(PageTags.WalletTag)}
                size="medium">
                Wallets
            </Button>
            <Button
                variant="outlined"
                className={tag === PageTags.NFTTag ? classes.selected : classes.button}
                onClick={() => onChange(PageTags.NFTTag)}
                size="medium">
                NFTs
            </Button>
            <Button
                variant="outlined"
                className={classNames(classes.hidden, tag === PageTags.DonationTag ? classes.selected : classes.button)}
                onClick={() => onChange(PageTags.DonationTag)}
                size="medium">
                Donations
            </Button>
            {daoPayload ? (
                <Button
                    variant="outlined"
                    className={tag === PageTags.DAOTag ? classes.selected : classes.button}
                    onClick={() => onChange(PageTags.DAOTag)}
                    size="medium">
                    DAO
                </Button>
            ) : null}
        </div>
    )
}
