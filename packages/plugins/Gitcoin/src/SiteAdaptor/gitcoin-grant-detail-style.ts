// Copy from Gitcoin grant detail page.
export const grantDetailStyle = `
.grant-detail a {
  color: #6F3FF5;
  text-decoration: none;
}
.grant-detail a:hover {
  color: #5932C4;
  text-decoration: underline;
}
.grant-detail p,
.grant-detail ol,
.grant-detail ul,
.grant-detail pre,
.grant-detail blockquote,
.grant-detail h1,
.grant-detail h2,
.grant-detail h3,
.grant-detail h4,
.grant-detail h5,
.grant-detail h6 {
    margin: 0;
    padding: 0;
    counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
}

.grant-detail ol,
.grant-detail ul {
    padding-left: 1.5em;
}

.grant-detail ol > li,
.grant-detail ul > li {
    list-style-type: none;
}

.grant-detail ul > li::before {
    content: '\\2022';
}

.grant-detail ul[data-checked='true'],
.grant-detail ul[data-checked='false'] {
    pointer-events: none;
}

.grant-detail ul[data-checked='true'] > li *,
.grant-detail ul[data-checked='false'] > li * {
    pointer-events: all;
}

.grant-detail ul[data-checked='true'] > li::before,
.grant-detail ul[data-checked='false'] > li::before {
    color: #777;
    cursor: pointer;
    pointer-events: all;
}

.grant-detail ul[data-checked='true'] > li::before {
    content: '\\2611';
}

.grant-detail ul[data-checked='false'] > li::before {
    content: '\\2610';
}

.grant-detail li::before {
    display: inline-block;
    white-space: nowrap;
    width: 1.2em;
}

.grant-detail li:not(.ql-direction-rtl)::before {
    margin-left: -1.5em;
    margin-right: 0.3em;
    text-align: right;
}

.grant-detail li.ql-direction-rtl::before {
    margin-left: 0.3em;
    margin-right: -1.5em;
}

.grant-detail ol li:not(.ql-direction-rtl),
.grant-detail ul li:not(.ql-direction-rtl) {
    padding-left: 1.5em;
}

.grant-detail ol li.ql-direction-rtl,
.grant-detail ul li.ql-direction-rtl {
    padding-right: 1.5em;
}

.grant-detail ol li {
    counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
    counter-increment: list-0;
}

.grant-detail ol li:before {
    content: counter(list-0, decimal) '. ';
}

.grant-detail ol li.ql-indent-1 {
    counter-increment: list-1;
}

.grant-detail ol li.ql-indent-1:before {
    content: counter(list-1, lower-alpha) '. ';
}

.grant-detail ol li.ql-indent-1 {
    counter-reset: list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
}

.grant-detail ol li.ql-indent-2 {
    counter-increment: list-2;
}

.grant-detail ol li.ql-indent-2:before {
    content: counter(list-2, lower-roman) '. ';
}

.grant-detail ol li.ql-indent-2 {
    counter-reset: list-3 list-4 list-5 list-6 list-7 list-8 list-9;
}

.grant-detail ol li.ql-indent-3 {
    counter-increment: list-3;
}

.grant-detail ol li.ql-indent-3:before {
    content: counter(list-3, decimal) '. ';
}

.grant-detail ol li.ql-indent-3 {
    counter-reset: list-4 list-5 list-6 list-7 list-8 list-9;
}

.grant-detail ol li.ql-indent-4 {
    counter-increment: list-4;
}

.grant-detail ol li.ql-indent-4:before {
    content: counter(list-4, lower-alpha) '. ';
}

.grant-detail ol li.ql-indent-4 {
    counter-reset: list-5 list-6 list-7 list-8 list-9;
}

.grant-detail ol li.ql-indent-5 {
    counter-increment: list-5;
}

.grant-detail ol li.ql-indent-5:before {
    content: counter(list-5, lower-roman) '. ';
}

.grant-detail ol li.ql-indent-5 {
    counter-reset: list-6 list-7 list-8 list-9;
}

.grant-detail ol li.ql-indent-6 {
    counter-increment: list-6;
}

.grant-detail ol li.ql-indent-6:before {
    content: counter(list-6, decimal) '. ';
}

.grant-detail ol li.ql-indent-6 {
    counter-reset: list-7 list-8 list-9;
}

.grant-detail ol li.ql-indent-7 {
    counter-increment: list-7;
}

.grant-detail ol li.ql-indent-7:before {
    content: counter(list-7, lower-alpha) '. ';
}

.grant-detail ol li.ql-indent-7 {
    counter-reset: list-8 list-9;
}

.grant-detail ol li.ql-indent-8 {
    counter-increment: list-8;
}

.grant-detail ol li.ql-indent-8:before {
    content: counter(list-8, lower-roman) '. ';
}

.grant-detail ol li.ql-indent-8 {
    counter-reset: list-9;
}

.grant-detail ol li.ql-indent-9 {
    counter-increment: list-9;
}

.grant-detail ol li.ql-indent-9:before {
    content: counter(list-9, decimal) '. ';
}

.grant-detail .ql-indent-1:not(.ql-direction-rtl) {
    padding-left: 3em;
}

.grant-detail li.ql-indent-1:not(.ql-direction-rtl) {
    padding-left: 4.5em;
}

.grant-detail .ql-indent-1.ql-direction-rtl.ql-align-right {
    padding-right: 3em;
}

.grant-detail li.ql-indent-1.ql-direction-rtl.ql-align-right {
    padding-right: 4.5em;
}

.grant-detail .ql-indent-2:not(.ql-direction-rtl) {
    padding-left: 6em;
}

.grant-detail li.ql-indent-2:not(.ql-direction-rtl) {
    padding-left: 7.5em;
}

.grant-detail .ql-indent-2.ql-direction-rtl.ql-align-right {
    padding-right: 6em;
}

.grant-detail li.ql-indent-2.ql-direction-rtl.ql-align-right {
    padding-right: 7.5em;
}

.grant-detail .ql-indent-3:not(.ql-direction-rtl) {
    padding-left: 9em;
}

.grant-detail li.ql-indent-3:not(.ql-direction-rtl) {
    padding-left: 10.5em;
}

.grant-detail .ql-indent-3.ql-direction-rtl.ql-align-right {
    padding-right: 9em;
}

.grant-detail li.ql-indent-3.ql-direction-rtl.ql-align-right {
    padding-right: 10.5em;
}

.grant-detail .ql-indent-4:not(.ql-direction-rtl) {
    padding-left: 12em;
}

.grant-detail li.ql-indent-4:not(.ql-direction-rtl) {
    padding-left: 13.5em;
}

.grant-detail .ql-indent-4.ql-direction-rtl.ql-align-right {
    padding-right: 12em;
}

.grant-detail li.ql-indent-4.ql-direction-rtl.ql-align-right {
    padding-right: 13.5em;
}

.grant-detail .ql-indent-5:not(.ql-direction-rtl) {
    padding-left: 15em;
}

.grant-detail li.ql-indent-5:not(.ql-direction-rtl) {
    padding-left: 16.5em;
}

.grant-detail .ql-indent-5.ql-direction-rtl.ql-align-right {
    padding-right: 15em;
}

.grant-detail li.ql-indent-5.ql-direction-rtl.ql-align-right {
    padding-right: 16.5em;
}

.grant-detail .ql-indent-6:not(.ql-direction-rtl) {
    padding-left: 18em;
}

.grant-detail li.ql-indent-6:not(.ql-direction-rtl) {
    padding-left: 19.5em;
}

.grant-detail .ql-indent-6.ql-direction-rtl.ql-align-right {
    padding-right: 18em;
}

.grant-detail li.ql-indent-6.ql-direction-rtl.ql-align-right {
    padding-right: 19.5em;
}

.grant-detail .ql-indent-7:not(.ql-direction-rtl) {
    padding-left: 21em;
}

.grant-detail li.ql-indent-7:not(.ql-direction-rtl) {
    padding-left: 22.5em;
}

.grant-detail .ql-indent-7.ql-direction-rtl.ql-align-right {
    padding-right: 21em;
}

.grant-detail li.ql-indent-7.ql-direction-rtl.ql-align-right {
    padding-right: 22.5em;
}

.grant-detail .ql-indent-8:not(.ql-direction-rtl) {
    padding-left: 24em;
}

.grant-detail li.ql-indent-8:not(.ql-direction-rtl) {
    padding-left: 25.5em;
}

.grant-detail .ql-indent-8.ql-direction-rtl.ql-align-right {
    padding-right: 24em;
}

.grant-detail li.ql-indent-8.ql-direction-rtl.ql-align-right {
    padding-right: 25.5em;
}

.grant-detail .ql-indent-9:not(.ql-direction-rtl) {
    padding-left: 27em;
}

.grant-detail li.ql-indent-9:not(.ql-direction-rtl) {
    padding-left: 28.5em;
}

.grant-detail .ql-indent-9.ql-direction-rtl.ql-align-right {
    padding-right: 27em;
}

.grant-detail li.ql-indent-9.ql-direction-rtl.ql-align-right {
    padding-right: 28.5em;
}

.grant-detail .ql-video {
    display: block;
    max-width: 100%;
}

.grant-detail .ql-video.ql-align-center {
    margin: 0 auto;
}

.grant-detail .ql-video.ql-align-right {
    margin: 0 0 0 auto;
}

.grant-detail .ql-bg-black {
    background-color: #000;
}

.grant-detail .ql-bg-red {
    background-color: #e60000;
}

.grant-detail .ql-bg-orange {
    background-color: #f90;
}

.grant-detail .ql-bg-yellow {
    background-color: #ff0;
}

.grant-detail .ql-bg-green {
    background-color: #008a00;
}

.grant-detail .ql-bg-blue {
    background-color: #06c;
}

.grant-detail .ql-bg-purple {
    background-color: #93f;
}

.grant-detail .ql-color-white {
    color: #fff;
}

.grant-detail .ql-color-red {
    color: #e60000;
}

.grant-detail .ql-color-orange {
    color: #f90;
}

.grant-detail .ql-color-yellow {
    color: #ff0;
}

.grant-detail .ql-color-green {
    color: #008a00;
}

.grant-detail .ql-color-blue {
    color: #06c;
}

.grant-detail .ql-color-purple {
    color: #93f;
}

.grant-detail .ql-font-serif {
    font-family: Georgia, Times New Roman, serif;
}

.grant-detail .ql-font-monospace {
    font-family: Monaco, Courier New, monospace;
}

.grant-detail .ql-size-small {
    font-size: 0.75em;
}

.grant-detail .ql-size-large {
    font-size: 1.5em;
}

.grant-detail .ql-size-huge {
    font-size: 2.5em;
}

.grant-detail .ql-direction-rtl {
    direction: rtl;
    text-align: inherit;
}

.grant-detail .ql-align-center {
    text-align: center;
}

.grant-detail .ql-align-justify {
    text-align: justify;
}

.grant-detail .ql-align-right {
    text-align: right;
}
`
