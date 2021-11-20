import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    name: {
        color: theme.palette.mode !== 'dark' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
    },
}))

interface DonationCardProps {
    imageUrl: string
    name: string
    contribCount: number
    contribDetails: {
        token: string
        amount: string
    }[]
    clickEvent?: () => void
}

const DonationCard = ({ imageUrl, name, contribCount, contribDetails, clickEvent = () => {} }: DonationCardProps) => {
    const { classes } = useStyles()
    return (
        <div
            className="flex flex-row items-center justify-start w-full border-2 rounded cursor-pointer text-body-text bg-body-bg border-donation-bg"
            onClick={clickEvent}>
            <img
                className="flex-shrink m-0.5 w-32 md:w-64 h-32 bg-cover bg-center bg-no-repeat rounded object-cover"
                src={imageUrl}
                alt={name}
            />
            <div className="flex-1 w-0 px-8">
                <p className={`w-full mb-2 text-lg font-semibold truncate ${classes.name}`}>{name}</p>
                <div className="flex flex-row w-full overflow-y-auto gap-x-6">
                    <div className="text-donation">
                        <div className="font-semibold">{contribCount}</div>
                        <div className="font-normal">Contrib</div>
                    </div>
                    {contribDetails.map((contrib, i) => (
                        <div key={i} className="text-donation">
                            <div className="font-semibold">{contrib.amount}</div>
                            <div className="font-normal">{contrib.token}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DonationCard
