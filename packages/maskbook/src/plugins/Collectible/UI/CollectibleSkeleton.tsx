import { CollectibleCard } from './CollectibleCard'
import { CardContent, CardHeader, Skeleton } from '@material-ui/core'

export function CollectibleSkeleton() {
    return (
        <CollectibleCard>
            <CardHeader
                avatar={<Skeleton animation="wave" variant="circular" width={40} height={40} />}
                title={
                    <>
                        <Skeleton animation="wave" height={18} style={{ marginBottom: 8 }} />
                        <Skeleton animation="wave" variant="rectangular" height={77} />
                    </>
                }
            />
            <CardContent style={{ paddingTop: 0, paddingBottom: 0 }}>
                <Skeleton animation="wave" variant="rectangular" height={35} style={{ marginBottom: 4 }} />
                <Skeleton animation="wave" variant="rectangular" height={280} />
            </CardContent>
        </CollectibleCard>
    )
}
