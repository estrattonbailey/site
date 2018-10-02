const path = require('path')
const Remarkable = require('remarkable')
const hljs = require('highlight.js')

const md = new Remarkable({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {}
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (err) {}

    return ''; // use external default escaping
  }
})

module.exports = function (props) {
  console.log(props)
  return `
    <!DOCTYPE html>
    <html lang='en'>
      <head>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <meta name='viewport' content='width=device-width,initial-scale=1'>
        <link rel='canonical' href='so-nice.site'>
        <title>${require('case').capital(path.basename(props.data.title))}</title>
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
