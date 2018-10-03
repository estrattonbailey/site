const path = require('path')
const Remarkable = require('remarkable')

const md = new Remarkable()

module.exports = function (props) {
  return `
    <!DOCTYPE html>
    <html lang='en'>
      <head>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <meta name='viewport' content='width=device-width,initial-scale=1'>
        <link rel='canonical' href='so-nice.site'>
        ${require('html-meta-tags')(props.data)}
        <link rel='stylesheet' href='/static/main.css' />
      </head>

      <body>
        <div id='root'>
          ${md.render(props.content)}
        </div>

        <script src='/static/index.js'></script>
      </body>
    </html>
  `
}
