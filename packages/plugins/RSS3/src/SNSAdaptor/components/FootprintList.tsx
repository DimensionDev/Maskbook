import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import { List, ListItem, ListProps } from '@mui/material'
import type { FC } from 'react'
import { FootprintCard, FootprintCardProps } from './FootprintCard'

export interface FootprintsLayoutProps {
    layout?: 'list' | 'grid'
}

const useStyles = makeStyles<{}, 'listItem' | 'card'>()((theme, _, refs) => {
    const listItem = {
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    } as const
    const card = {} as const

    return {
        list: {},
        grid: {
            display: 'grid',
            padding: 0,
            gridTemplateColumns: 'repeat(3, 1fr)',
            [`& .${refs.listItem}`]: {
                borderRadius: '100%',
                aspectRatio: '1 / 1',
            },
            [`& .${refs.card}`]: {
                marginBottom: 0,
                padding: 0,
            },
        },
        listItem,
        card,
    }
})

interface Props extends Omit<ListProps, 'onSelect'>, Pick<FootprintCardProps, 'onSelect'>, FootprintsLayoutProps {
    footprints: RSS3BaseAPI.Footprint[]
}

export const FootprintList: FC<Props> = ({ className, footprints, onSelect, layout = 'list', ...rest }) => {
    const { classes } = useStyles({ layout })
    return (
        <List {...rest} className={layout === 'grid' ? classes.grid : classes.list}>
            {[...footprints, ...footprints, ...footprints, ...footprints].map((footprint) => (
                <ListItem className={classes.listItem} key={footprint.index}>
                    <FootprintCard
                        className={classes.card}
                        footprint={footprint}
                        onSelect={onSelect}
                        disableDescription={layout === 'grid'}
                    />
                </ListItem>
            ))}
        </List>
    )
}
