import { Avatar, Link } from '@mui/material'

export interface LinkingAvatarProps {
    href: string
    title: string
    name: string
    src: string
}

export function LinkingAvatar(props: LinkingAvatarProps) {
    const { href, title, src, name } = props

    try {
        const url = new URL(href).toString()
        return (
            <Link href={url} title={title} target="_blank" rel="noopener noreferrer">
                <Avatar src={src}>{name.slice(0, 1).toUpperCase()}</Avatar>
            </Link>
        )
    } catch {
        return <Avatar src={src} />
    }
}
