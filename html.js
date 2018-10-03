const path = require('path')
const Remarkable = require('remarkable')

const md = new Remarkable()

module.exports = function (props) {
  return `
    <!DOCTYPE html>
    <html lang='en'>
      <head>
        <script>console.log('so nice')</script>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <meta name='viewport' content='width=device-width,initial-scale=1'>
        <link rel='canonical' href='so-nice.site'>
        <title>${props.data.title}</title>
        ${require('html-meta-tags')(props.data)}
        <link rel='stylesheet' href='/static/main.css' />

        <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-40494652-19', 'auto');
        ga('send', 'pageview');
        </script>
      </head>

      <body>
        <div id='root'>
          ${md.render(props.content)}
        </div>
      </body>
    </html>
  `
}
