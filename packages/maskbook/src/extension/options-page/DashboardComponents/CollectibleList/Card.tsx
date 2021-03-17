import Tilt from 'react-tilt'
import { Card, createStyles, Link, makeStyles } from '@material-ui/core'
import { Image } from '../../../../components/shared/Image'
import { MaskbookIconOutlined } from '../../../../resources/MaskbookIcon'

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
        placeholder: {
            width: 64,
            height: 64,
            opacity: 0.1,
        },
    }),
)

export interface CollectibleCardProps {
    url: string
    link: string
    canViewOnEtherscan?: boolean
}

export function CollectibleCard(props: CollectibleCardProps) {
    const classes = useStyles(props)

    return (
        <Link target="_blank" rel="noopener noreferrer" href={props.link}>
            <Tilt options={{ scale: 1, max: 30, glare: true, 'max-glare': 1, speed: 1000 }}>
                <Card
                    className={classes.root}
                    style={{
                        width: 160,
                        height: 220,
                    }}>
                    {props.url ? (
                        <Image
                            component="img"
                            width={140}
                            height={220}
                            style={{ objectFit: 'contain' }}
                            src={props.url}
                        />
                    ) : (
                        <MaskbookIconOutlined className={classes.placeholder} />
                    )}
                </Card>
            </Tilt>
        </Link>
    )
}
