const fs = require('fs')
const path = require('path')
const router = require('router')()
const html = require('./html.js')
const fetch = require('node-fetch')
const fm = require('gray-matter')

const { NOW } = process.env

router.get('/', (req, res) =>  {
  console.log('req', req.url)
  const content = html({
    data: {
      title: 'so nice'
    },
    content: 'so nice'
  })
  console.log(content)
  res.statusCode = 200
  res.end(content)
})

router.get('*', (req, res) => {
  const file = req.url.replace('.md', '') + '.md'

  if (!NOW) {
    return res.end(html(require('gray-matter')(fs.readFileSync(path.join(__dirname, 'posts', file), 'utf8'))))
  }

  fetch(`https://api.github.com/repos/estrattonbailey/blog/contents/posts/${path.basename(file)}`)
    .then(res => res.json())
    .then(res => {
      console.log({ res })
      return Buffer.from(res.content, 'base64').toString('utf-8')
    })
    .then(content => {
      res.statusCode = 200
      res.end(html(require('gray-matter')(content)))
    })
    .catch(e => {
      res.statusCode = 500
      res.end(html({
        data: {
          title: 'not nice',
          description: 'something went wrong'
        },
        content: 'not nice :('
      }))
    })
})

require('connect')()
  .use(require('compression')())
  .use(require('serve-static')('public'))
  .use((req, res, next) => {
    res.setHeader('Content-Type', 'text/html')
    next()
  })
  .use(router)
  .listen(3000)
