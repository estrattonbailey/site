const fs = require('fs')
const path = require('path')
const router = require('router')()
const html = require('./html.js')
const fetch = require('node-fetch')
const fm = require('gray-matter')

const { NOW } = process.env

router.get('/', (req, res) =>  {
  res.statusCode = 200
  res.end(html({
    data: {
      title: 'so nice'
    },
    content: 'so nice'
  }))
})

router.get('*', (req, res) => {
  const file = req.url.replace('.md', '') + '.md'

  if (!NOW) {
    return res.end(html(require('gray-matter')(fs.readFileSync(path.join(__dirname, 'posts', file), 'utf8'))))
  }

  fetch(`https://api.github.com/repos/estrattonbailey/blog/contents/posts/${path.basename(file)}`)
    .then(res => {
      console.log({ status: res.status })
      return res.json()
    })
    .then(res => {
      if (res.content) {
        const content = Buffer.from(res.content, 'base64').toString('utf-8')
        res.statusCode = 200
        res.end(html(require('gray-matter')(content)))
      } else {
        res.statusCode = 404
        res.end(html({
          data: {
            title: 'not nice',
            description: `sorry, i couldn't find what you're looking for`
          },
          content: 'not very nice'
        }))
      }
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
