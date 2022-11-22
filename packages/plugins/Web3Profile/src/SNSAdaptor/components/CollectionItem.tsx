import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useI18N } from '../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    flexItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 12,
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
    },
}))

interface CollectionItemProps extends withClasses<'root' | 'list' | 'collectionWrap'> {
    title: string
    walletsNum: number
    collectionNum: number
    onClick: () => void
}
export function CollectionItem(props: CollectionItemProps) {
    const { title, walletsNum, collectionNum, onClick } = props
    const { classes } = useStyles(undefined, { props })
    const t = useI18N()

    return (
        <div className={classes.flexItem} onClick={onClick}>
            <div>
                <Typography fontWeight={700}>{title}</Typography>
                <Typography fontWeight={700} fontSize={12}>
                    <span>{walletsNum}</span> {`${t.wallets()} `}
                    <span>{collectionNum}</span> {title}
                </Typography>
            </div>
            <Icons.ArrowRight size={24} className={classes.arrowIcon} />
        </div>
    )
}
