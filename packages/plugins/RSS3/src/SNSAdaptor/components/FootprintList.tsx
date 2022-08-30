import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import { List, ListItem, ListProps, Tooltip } from '@mui/material'
import type { FC } from 'react'
import { FootprintCard, FootprintCardProps } from './FootprintCard'

export interface FootprintsLayoutProps {
    layout?: 'list' | 'grid'
}

const useStyles = makeStyles<{}, 'listItem' | 'card' | 'cardImage'>()((theme, _, refs) => {
    return {
        list: {},
        grid: {
            display: 'grid',
            padding: 0,
            gridTemplateColumns: 'repeat(3, 1fr)',
            [`& .${refs.listItem}`]: {
                borderRadius: '100%',
                aspectRatio: '1 / 1',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
            [`& .${refs.card}`]: {
                marginBottom: 0,
                padding: 0,
            },
            [`& .${refs.cardImage}`]: {
                backgroundColor: 'transparent',
                height: 120,
                width: 120,
            },
        },
        listItem: {},
        card: {},
        cardImage: {},
    }
})

interface Props extends Omit<ListProps, 'onSelect'>, Pick<FootprintCardProps, 'onSelect'>, FootprintsLayoutProps {
    footprints: RSS3BaseAPI.Footprint[]
}

export const FootprintList: FC<Props> = ({ className, footprints, onSelect, layout = 'list', ...rest }) => {
    const { classes } = useStyles({ layout })
    const isGrid = layout === 'grid'
    return (
        <List {...rest} className={isGrid ? classes.grid : classes.list}>
            {footprints.map((footprint) => (
                <ListItem className={classes.listItem} key={footprint.index}>
                    {isGrid ? (
                        <Tooltip
                            title={footprint.actions[0].metadata?.name ?? ''}
                            placement="top"
                            disableInteractive
                            PopperProps={{
                                disablePortal: true,
                            }}
                            arrow>
                            <FootprintCard
                                classes={{ img: classes.cardImage }}
                                className={classes.card}
                                footprint={footprint}
                                onSelect={onSelect}
                                disableDescription
                            />
                        </Tooltip>
                    ) : (
                        <FootprintCard className={classes.card} footprint={footprint} onSelect={onSelect} />
                    )}
                </ListItem>
            ))}
        </List>
    )
}
