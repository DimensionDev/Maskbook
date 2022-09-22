import { makeStyles } from '@masknet/theme'

export interface CollectibleGridProps {
    columns?: number
    gap?: string | number
}

export const useStyles = makeStyles<CollectibleGridProps>()((theme, { columns = 3, gap = 2 }) => {
    const gapIsNumber = typeof gap === 'number'
    return {
        root: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridGap: gapIsNumber ? theme.spacing(gap) : gap,
            padding: gapIsNumber ? theme.spacing(0, gap, 0) : `0 ${gap} 0`,
            boxSizing: 'border-box',
        },
        collectibleItem: {
            overflowX: 'hidden',
        },
        container: {
            boxSizing: 'border-box',
            paddingTop: gapIsNumber ? theme.spacing(gap) : gap,
        },
        text: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
        },
        button: {
            '&:hover': {
                border: 'solid 1px transparent',
            },
        },
        list: {
            height: 'calc(100% - 52px)',
            overflow: 'auto',
        },
        sidebar: {
            width: 30,
            flexShrink: 0,
        },
        name: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            lineHeight: '36px',
            paddingLeft: '8px',
        },
        loading: {
            position: 'absolute',
            bottom: 6,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
        },
        collectionWrap: {
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(229,232,235,1)',
        },
        collectionImg: {
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
        },
        networkSelected: {
            width: 24,
            height: 24,
            minHeight: 24,
            minWidth: 24,
            lineHeight: '24px',
            background: theme.palette.primary.main,
            color: '#ffffff',
            fontSize: 10,
            opacity: 1,
            '&:hover': {
                background: theme.palette.primary.main,
            },
        },
        collectionButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            minWidth: 30,
            maxHeight: 24,
        },
    }
})
