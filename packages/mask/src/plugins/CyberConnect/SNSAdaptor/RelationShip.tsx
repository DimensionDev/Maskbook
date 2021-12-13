import { makeStyles } from '@masknet/theme'
// import * from '@ethersproject'
const useStyles = makeStyles()((theme) => ({
    relationShip: {
        display: 'flex',
        alignItems: 'center',
        height: '100px',
        width: '100%',
        justufyContent: 'center',
    },
    section: { width: 'calc(50% - 1px)', textAlign: 'center' },
    divider: { width: '1px', height: '70px', background: '#f2f2f2' },
    count: { fontSize: '28px', fontWeight: 600 },
    text: { fontSize: '16px', opacity: 0.6 },
}))

const RelationShip = ({
    followingCount,
    followerCount,
}: {
    followingCount?: number | undefined
    followerCount: number | undefined
}) => {
    const { classes } = useStyles()
    return (
        <div className={classes.relationShip}>
            <div className={classes.section}>
                <div className={classes.count}>{followingCount}</div>
                <div className={classes.text}>Followings</div>
            </div>
            <div className={classes.divider} />
            <div className={classes.section}>
                <div className={classes.count}>{followerCount}</div>
                <div className={classes.text}>Followers</div>
            </div>
        </div>
    )
}

export default RelationShip
