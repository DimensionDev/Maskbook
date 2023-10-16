import { Icon, Image } from '@masknet/shared'
import { Link } from '@mui/material'

interface LinkingAvatarProps {
    href: string
    title: string
    name: string
    src: string
}

export function LinkingAvatar(props: LinkingAvatarProps) {
    const { href, title, src, name } = props

    const image = <Image src={src} size={48} rounded fallback={<Icon size={48} name={name} />} />
    if (URL.canParse(href)) {
        const url = new URL(href).toString()
        return (
            <Link href={url} title={title} target="_blank" rel="noopener noreferrer">
                {image}
            </Link>
        )
    } else {
        return image
    }
}
