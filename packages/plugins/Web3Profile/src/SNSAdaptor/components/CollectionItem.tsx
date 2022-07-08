import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { ArrowIcon } from '../assets/Arrow'

const useStyles = makeStyles()((theme) => ({
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
}))

interface CollectionItemProps extends withClasses<never | 'root' | 'list' | 'collectionWrap'> {
    title: string
    walletsNum: number
    collectionNum: number
    onClick: () => void
}
export function CollectionItem(props: CollectionItemProps) {
    const { title, walletsNum, collectionNum, onClick } = props
    const classes = useStylesExtends(useStyles(), props)
    const t = useI18N()

    return (
        <div className={classes.flexItem} onClick={onClick}>
            <div>
                <Typography style={{ fontWeight: '700' }}>{title}</Typography>
                <Typography>
                    <span style={{ fontWeight: '700' }}>{walletsNum}</span> {t.wallets()}{' '}
                    <span style={{ fontWeight: '700' }}>{collectionNum}</span> {title}
                </Typography>
            </div>
            <ArrowIcon className={classes.arrowIcon} />
        </div>
    )
}
