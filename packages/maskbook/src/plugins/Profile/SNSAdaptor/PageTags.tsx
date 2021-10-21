import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import classNames from 'classnames'
import { useI18N } from '../../../utils'
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
}))

interface TabPageTagsProps {
    onChange: (tag: PageTags) => void
    tag: PageTags
}

export function TabPageTags(props: TabPageTagsProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { onChange, tag } = props
    return (
        <div className={classes.root}>
            <Button
                className={classNames(classes.button, tag === PageTags.TagWallet ? classes.selected : '')}
                onClick={() => onChange(PageTags.TagWallet)}
                size="medium">
                {t('wallets')}
            </Button>
            <Button
                className={classNames(classes.button, tag === PageTags.TagNFT ? classes.selected : '')}
                onClick={() => onChange(PageTags.TagNFT)}
                size="medium">
                {t('nfts')}
            </Button>
            <Button
                className={classNames(classes.button, tag === PageTags.TagDonation ? classes.selected : '')}
                onClick={() => onChange(PageTags.TagDonation)}
                size="medium">
                {t('donations')}
            </Button>
        </div>
    )
}
