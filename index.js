const fs = require('fs')
const path = require('path')
const router = require('router')()
const html = require('./html.js')
const fetch = require('node-fetch')
const fm = require('gray-matter')

router.get('/', (req, res) =>  {
  res.end(html({
    title: 'estrattonbailey',
    content: 'Hello'
  }))
})

router.get('*', (req, res) => {
  if (!fs.existsSync(path.join(__dirname, req.url))) return res.end('404')

  fetch(`https://api.github.com/repos/estrattonbailey/blog/contents/${path.basename(req.url)}`)
    .then(res => res.json())
    .then(res => {
      return Buffer.from(res.content, 'base64').toString('utf-8')
    })
    .then(content => {
      res.end(html(require('gray-matter')(content)))
    })
})

require('connect')()
  .use(require('compression')())
  .use((req, res, next) => {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    })

    next()
  })
  .use(router)
  .listen(3000)
