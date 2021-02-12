import { SvgIconProps, SvgIcon } from '@material-ui/core'

const svg = (
    <svg width="24" height="24" viewBox="0 0 258 258" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="Spread" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g id="pebbles-pad" transform="translate(1.000000, 1.000000)" fill="#FFFFFF">
                <g id="pebbles" transform="translate(17.000000, 38.000000)">
                    <g transform="translate(0.000000, 0.741803)">
                        <path
                            d="M155.878763,109.234443 C194.82596,114.994114 222,128.020689 222,143.168033 C222,163.652365 172.303607,180.258197 111,180.258197 C49.6963928,180.258197 0,163.652365 0,143.168033 C0,128.020689 27.1740399,114.994114 66.121237,109.234443 C79.4985588,111.954918 94.776664,113.495902 111,113.495902 C126.816331,113.495902 141.734263,112.031267 154.869366,109.438764 Z"
                            id="peb-bot"></path>
                        <path
                            d="M139.092748,48.2491027 C174.367502,52.176856 199.8,63.2988713 199.8,76.4057377 C199.8,92.7932032 160.042886,106.077869 111,106.077869 C61.9571142,106.077869 22.2,92.7932032 22.2,76.4057377 C22.2,63.2988713 47.6324978,52.176856 82.9072522,48.2491027 C91.5473488,49.6620291 101.039152,50.442623 111,50.442623 C120.612406,50.442623 129.788009,49.715686 138.182799,48.3955286 Z"
                            id="peb-med"></path>
                        <g id="peb-top" transform="translate(44.400000, 0.000000)">
                            <ellipse id="peb-sm" cx="66.6" cy="22.2540984" rx="66.6" ry="22.2540984"></ellipse>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </svg>
)

export function BalancerIcon(props: SvgIconProps) {
    return <SvgIcon {...props}>{svg}</SvgIcon>
}
