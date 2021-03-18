import Tilt from 'react-tilt'
import { Card, createStyles, Link, makeStyles } from '@material-ui/core'
import ImageIcon from '@material-ui/icons/Image'
import { Image } from '../../../../components/shared/Image'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            position: 'relative',
            backgroundColor: theme.palette.background.paper,
        },
    }),
)

export interface CollectibleCardProps {
    url: string
    link: string | undefined
    canViewOnEtherscan?: boolean
}

export function CollectibleCard(props: CollectibleCardProps) {
    const classes = useStyles(props)

    return (
        <Link target="_blank" rel="noopener noreferrer" href={props.link ?? ''}>
            <Tilt options={{ scale: 1, max: 30, glare: true, 'max-glare': 1, speed: 1000 }}>
                <Card
                    className={classes.root}
                    style={{
                        width: 160,
                        height: 220,
                    }}>
                    {props.url ? <Image component="img" width={160} height={220} src={props.url} /> : <ImageIcon />}
                </Card>
            </Tilt>
        </Link>
    )
}
