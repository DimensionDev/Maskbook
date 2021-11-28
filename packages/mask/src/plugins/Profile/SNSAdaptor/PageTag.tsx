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
        borderRadius: 9999,
    },
    selected: {
        border: `1px solid ${theme.palette.primary.contrastText} !important`,
        color: theme.palette.primary.contrastText,
    },
    hidden: {
        display: 'none',
    },
}))

interface PageTagProps {
    onChange: (tag: PageTags) => void
    tag: PageTags
    daoPayload: Dao_Payload | undefined
}

export function PageTag(props: PageTagProps) {
    const { classes } = useStyles()
    const { onChange, tag, daoPayload } = props
    return (
        <div className={classes.root}>
            <Button
                variant="outlined"
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
                variant="outlined"
                className={classNames(classes.button, tag === PageTags.NFTTag ? classes.selected : '')}
                onClick={() => onChange(PageTags.NFTTag)}
                size="medium">
                NFTs
            </Button>
            <Button
                variant="outlined"
                className={classNames(
                    classes.hidden,
                    classes.button,
                    tag === PageTags.DonationTag ? classes.selected : '',
                )}
                onClick={() => onChange(PageTags.DonationTag)}
                size="medium">
                Donations
            </Button>
            {daoPayload ? (
                <Button
                    variant="outlined"
                    className={classNames(classes.button, tag === PageTags.DAOTag ? classes.selected : '')}
                    onClick={() => onChange(PageTags.DAOTag)}
                    size="medium">
                    DAO
                </Button>
            ) : null}
        </div>
    )
}
