import { Typography } from '@mui/material'
interface DonationCardProps {
    imageUrl: string
    name: string
    contribCount: number
    contribDetails: {
        token: string
        amount: string
    }[]
}

const DonationCard = ({ imageUrl, name, contribCount, contribDetails }: DonationCardProps) => {
    return (
        <div className="flex flex-row items-center justify-start w-full border-2 rounded cursor-pointer text-body-text bg-body-bg border-donation-bg">
            <img
                className="flex-shrink m-0.5 w-32 md:w-64 h-32 bg-cover bg-center bg-no-repeat rounded object-cover"
                src={imageUrl}
                alt={name}
            />
            <div className="flex-1 w-0 px-8 flex flex-col justify-around">
                <Typography variant="h6" color="textPrimary" fontWeight={600} className="w-full truncate">
                    {name}
                </Typography>
                <div className="flex flex-row w-full overflow-y-auto gap-x-6">
                    <div className="text-donation">
                        <Typography variant="subtitle1">{contribCount}</Typography>
                        <Typography variant="subtitle1">Contrib</Typography>
                    </div>
                    {contribDetails.map((contrib, i) => (
                        <div key={i} className="text-donation">
                            <Typography variant="subtitle1">{contrib.amount}</Typography>
                            <Typography variant="subtitle1">{contrib.token}</Typography>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DonationCard
