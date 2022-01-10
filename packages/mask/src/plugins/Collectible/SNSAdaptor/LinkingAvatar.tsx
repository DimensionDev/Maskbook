import { Avatar, Link } from '@mui/material'
interface LinkingAvatarProps {
    href: string
    title: string
    src: string
}
export function LinkingAvatar(props: LinkingAvatarProps) {
    const { href, title, src } = props
    try {
        const url = new URL(href)
        return (
            <Link href={url.href} title={title} target="_blank" rel="noopener noreferrer">
                <Avatar src={src} />
            </Link>
        )
    } catch {
        return <Avatar src={src} />
    }
}
