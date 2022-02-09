export default function IdeaMarketIcon(props: any) {
    return (
        <img
            className={props.className}
            width={props.width ? props.width : undefined}
            height={props.height ? props.height : undefined}
            src={new URL('./ideamarket-logo.png', import.meta.url).toString()}
            alt="ideamarket logo"
        />
    )
}
