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
      title: 'this is all there is'
    },
    content: 'so nice'
  }))
})

router.get('*', (req, res) => {
  const file = req.url.replace('.md', '') + '.md'

  if (!NOW && fs.existsSync(path.join(__dirname, 'posts', file), 'utf8')) {
    return res.end(html(require('gray-matter')(fs.readFileSync(path.join(__dirname, 'posts', file), 'utf8'))))
  }

  fetch(`https://api.github.com/repos/estrattonbailey/blog/contents/posts/${path.basename(file)}`)
    .then(r => r.json())
    .then(r => {
      if (r.content) {
        res.statusCode = 200
        res.end(html(require('gray-matter')(Buffer.from(r.content, 'base64').toString('utf-8'))))
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
      console.log(e)
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
