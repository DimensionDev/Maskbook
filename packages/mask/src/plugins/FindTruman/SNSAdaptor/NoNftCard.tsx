import { Box, CardMedia, Typography, Card, CardContent, CardActions, Button, Theme, Divider } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { PuzzleCondition } from '../types'
import { useContext } from 'react'
import { FindTrumanContext } from '../context'
import type { SxProps } from '@mui/system'

const useStyles = makeStyles()((theme) => {
    return {
        card: {
            borderRadius: '6px',
            ':not(:last-child)': {
                marginBottom: '8px',
            },
            display: 'flex',
            flexDirection: 'column',
        },
        content: {
            flex: 1,
        },
        title: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            textTransform: 'uppercase',
        },
    }
})

interface NoNftCardProps {
    cardHeight?: number
    conditions: PuzzleCondition[]
    sx?: SxProps<Theme>
    onClick?: () => void
}
export default function NoNftCard(props: NoNftCardProps) {
    const { cardHeight, conditions, sx, onClick } = props
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)

    const renderNftCard = (title: string, img: string, url: string, count: number, address: string) => {
        return (
            <Card
                sx={{
                    cursor: onClick ? 'pointer' : 'auto',
                    height: cardHeight || 'auto',
                }}
                onClick={() => {
                    onClick?.()
                }}
                key={address}
                className={classes.card}
                variant="outlined">
                <CardMedia component="img" image={img} />
                <CardContent className={classes.content}>
                    <Typography gutterBottom variant="h5" component="div">
                        {title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {t(count > 1 ? 'plugin_find_truman_buy_nfts_tip' : 'plugin_find_truman_buy_nft_tip', { count })}
                    </Typography>
                </CardContent>
                <CardActions sx={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.stopPropagation()
                        }}
                        component="a"
                        href={url}
                        variant="contained"
                        target="_blank"
                        size="small">
                        {t('plugin_find_truman_buy')}
                    </Button>
                </CardActions>
            </Card>
        )
    }

    return (
        <Card
            className={classes.card}
            variant="outlined"
            onClick={() => {
                onClick?.()
            }}
            sx={{ marginTop: 1, height: cardHeight || 'auto', cursor: onClick ? 'pointer' : 'auto', ...(sx || {}) }}>
            <CardContent>
                <Typography variant="h6" component="div">
                    {t('plugin_find_truman_decrypt_tip')}
                </Typography>
                <Divider sx={{ margin: '8px 0' }} />
                <Box>
                    {conditions.map((condition) => (
                        <Typography variant="body2" color="textSecondary" gutterBottom key={condition.name}>
                            <li>
                                {condition.minAmount} {condition.name}
                            </li>
                        </Typography>
                    ))}
                </Box>
            </CardContent>
        </Card>
    )
}
