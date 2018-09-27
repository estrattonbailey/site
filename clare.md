# Building Headless

For many studios like ours, Shopify is the de-facto standard for e-commerce.
It's simplicity is its strength, and what Shopify has lacked in the past in
terms of flexibility, extension, and content management, it has made up for with
stability and ease of use.

Even given its limitations, devs have found creative work-arounds using tags,
collections, metafields, and naming conventions to do just about anything that a
client asks of them. But these work-arounds often come at a price of code
complexity and technical debt, and they rarely do much to alleviate the pains of
content management and integrations with external systems and APIs.

Until relatively recently, building on Shopify meant *building on Shopify*:
using Liquid templates, and dreaming up clever solutions to problems like
content management and data manipulation. With the introduction of the
Storefront GraphQL API, much of this has changed.

For one of our latest sites, [Clare](https://www.clare.com), we opted to
*decouple* Shopify. Decoupling *backend* from *frontend* – or "going headless" –
refers to separating a site's data layer from its presentation layer. This
allows for added flexibility in templating, content structure, and can add some
additional "future proofing” in the sense that the site can accommodate multiple
sources of data independent of whatever core backend technology is being used. 

## Initial Project Goals and Concerns
Clare wanted an elevated e-commerce experience, and requested some more advanced
features features like their Clare Color Genius and My Colors favoriting
functionality. We also wanted to deliver a quality editorial experience, and
enable their team to make use of heavy cross-product relational content.

Of course, these are all things that Shopify does not easily accommodate, so we
knew early on that we'd be reaching for more advanced systems like Contentful,
and would likely need to run our own server.

Limiting complexity and technical debt being top of mind, we began to weigh two
options: integrating Contentful and a separate server into a Shopify hosted
theme, or building headless from the get-go.

Our experience with the former is that it often leads more quickly to unneeded
complexity and tech debt. You also end up maintaining, in a sense, two
codebases: the Shopify theme and the frontend framework rendering your external
data. Think: two sets of template components, two patterns of javascript, two build
processes, etc. Not to mention SEO, which can be a major issue if pertinent data
needs to come from an external data source and therefore isn't available on
initial page load.

The latter reduces the number of moving parts to a single codebase, and has the
added benefits of a greatly improved developer experience and direct integration
into the server we were planning on building already. SEO is also no longer an
issue, because most frameworks make it trivial to render on the server and
hydrate from the frontend into a fully function javascript application.

## Our Stack
Our framework of choice at the moment is React (though we're very interested in
Vue!). We love systems like Next.js, Gatsby, Razzle, and others, but in looking
ahead to our needs both front and backend, we opted to start from scratch for
the most part.

We also wanted to simplify certain pieces that become pretty cumbersome as
codebases grow during a build, like data fetching, state management and routing.
Much of this should probably be covered in another post, but I'll briefly touch
on the core pieces of our stack.

### Data and State
Early on, we investigated *schema stitching* our APIs together into a single
GraphQL API that we would host on a separate server. As we got into it, we
decided that the additional layer of abstraction and the debt that comes with it
wasn't necessary. Really at most, we're sending two core data requests for each
page, and often only one.

Handling multiple async requests, managing state, caching, and DOM renders is
tough. There are patterns out there do some or all of these things, but are
often cumbersome and rather on the large side in terms of KB of download.

Instead of obscuring these layers, we brought them to the surface. We call our
APIs, and cache data using simple keys, like the current route, on our root
state object. Before loading anything, our cache checks for the existence of
that simple key and either uses that or fetches fresh data.

For managing this state, we used picostate, which is a simple wrapper around
essentially a javascript object. It gave us the ability to put data into the
application asynchronously, and only fire updates and render the app when we
were good and ready.

### Routing
Similar to picostate, we used foil as a transparent routing solution (it uses
picostate internally). Foil's pattern is somewhat of a departure from most
routers in the React ecosystem in that it too allows us to define exactly *when*
to navigate to the next route.

This allows us to easily load data, cache it, perform a route transition, and
render the new data and view at exactly the moments we want.

### Server
We're running a single Node server, hosted on now, and built with connect and
router. It handles all incoming requests for the site itself, as well as a few
microservices that we use within the experience like the My Colors favoriting,
email signups, and vanity URL redirects.

Application routes are then resolved using foil. For matching paths, we
bootstrap required global data, load the route's data, and render our view with
the hydration data on the window object. If a route doesn't match, or an error
occurs, we instead render a 404 and send the errors off to our logging service.

Also important to note: we render to an HTML stream using the new
`renderToNodeStream` API in React 16, which gives us measurably faster time to
first byte (TTFB). Overall it was a great experience using streams in favor of
static strings.

## Content Management
Data like price, inventory, fulfillment, etc, are managed in Shopify for each
product. All other content is populated via Contentful, using the Shopify
product handle or "slug" to related a given product in Shopify to a given entry
in Contentful. Managing content in this way allowed us to leverage the full
power of Contentful, without having to work around Shopify's limitations.

For instance, each paint color is populated as two separate entries: a root
Color content type, and a parent PDP content type. We did this to maximize data
efficiency for pages that only require color information, like the CLPs and the
Clare Color Genius. PDPs are then populated by relating a root Color, which is sent
along the API as a "child" link in a single resolved API request. This means
operations like CLP filtering are faster because we aren't loading unessesary data
wherever possible.

Additionally, most pages on the site, including PDPs, are fully modular. Many of
our clients have come to expect this from content experiences, and using a
robust CMS like Contentful makes this a breeze. We can quickly spin up new pages
that include heros, product slideshows, blog content – you name it.

### Staging Site(s)
Another big win for the headless approach was the ability to deploy a staging
site. Contentful has a Preview API built in that allows you to load un-published
content from your drafts in a production setting. This makes it easy to preview
everything from blog posts to homepage hero updates.

In addition to a permanent staging site, hosting on now allows us to take full
advantage of their immutable deployments. Basically, this allows us to deploy
code to unique URLs so that the client and our internal team can test and review
updates in a production setting. Other hosting services provide this of course,
but it truly is a joy using now.

## Clare Color Genius and User Lists
One of the parts of the site we're most excited about is the Clare Color Genius,
or what we call the "Quiz" for short. This quiz is part of a larger flow that
allows users to generate personalized color suggestions, as well as save their
results to custom lists that they can manage from their account pages.

The Quiz is a instant message-like flow that captures user inputs and runs them
through a series of successive sorting processes to filter and rank colors based
on attributes populated in Contentful. Each step is built as a separate entity,
with sorting, ranking, input validation, and UI logic contained within it.
By specifying previous and next step IDs on each step, the application boots up
to form a linked list of these steps, which can then be followed up or down the
logic tree as needed.

When a user completes the quiz, colors are returned and displayed. Users can opt
to save their results to a new list, titled by the type of room they are
painting. A neat feature of these lists is that users have the option of
populating a default list even if they aren't registered users of Clare. These
results are stored using the Local Storage API in their browsers.

Users can optionally create an account, which allows them to create more lists,
in addition to the default Shopify account functionality like managing
addresses. The accounts were built entirely with the Shopify Storefront API. The
lists therein are managed by a simple microservice running on the Node server
that performs CRUD operations on metafield of the Shopify user object, using the
Shopify Admin API.

## The Checkout
The checkout flow for Clare is still hosted on Shopify. Every time the site
loads, we either hydrate an existing checkout session from a cookie, or create a
new checkout using the Storefront API.

When a user clicks "Checkout" from their shopping cart on the frontend, the
application sends a request to Shopify's servers to associate the checkout
object with a user (if available), and then follows the provided URL to the
checkout flow on Shopify.

An interesting caveat of this process is that Shopify needs to be hosted on a
subdomain. In our case, we opted for cart.clare.com. This allows for analytics
to correctly track conversions within single sessions, and reduces user
confusion, should they notice that the domain updated upon clicking "Checkout".

## Considerations
For anyone looking into building in a similar fashion, there are a few things
we'd like to call out that either tripped us up, or are simply important to
remember when going headless on Shopify.

### Domains
Shopify needs to live on a subdomain. If it doesn't, you'll need to use Google
Analytics cross-domain linking (or whatever analytics service you use) in order
to accurately track conversions.

You'll also need to handle redirects from Shopify URLs to your custom URLs (if
they are custom; ours are). For this, we used a simple javascript redirect in
the `<head>` of the Shopify theme. If a user were to navigate directly to
cart.clare.com, it would redirect them to the usual www.clare.com,
cart.clare.com/products to www.clare.com/paint/wall, and so on.

### Apps and Integrations
Of course, if your frontend isn't *on* Shopify, then any apps that require
template modification won't work. This usually pertains to apps like reviews or
email signups. Most can still be implemented by a developer, but it's something
that your clients should be made aware of early on.

Any apps that function behind the scenes on Shopify, like fullfillment
integrations, function normally.

### Analytics
Similar to many Shopify Apps, many analytics scripts prescribe simply pasting
script tags into the template code. We opted to implement Segment, for two
reasons: a standardized API for tracking events and data, and it provides an
easy interface for the client to add most scripts they would need.

## The Experience
Building using tools like React and powerful APIs like Contentful and the
Storefront API of course makes for an excellent developer experience, but it also
increases the speed and flexibility that we have when updating and extending
functionality.

This site is heavily componentized, with pieces as small as individual form
fields being reusable and extendable. New features can easily be built out that
match the rest of the design system, and can easily be hooked up to whatever
data stream they require. That speed and consistency are huge benefits to
working with systems like this.

Contentful provides a far more advanced, yet still friendly, content editing
experience. There's definitely a learning curve, but considering the
capabilities you gain over the simplicity of Shopify, it's a worthy endeavor to
dive in and get comfortable with Contentful, and we get better at onboarding
clients with each site we build with the platform.

* * *

Overall, we really enjoyed building Shopify like this, and would definitely do
it again, given the need.

Also, we aren't really aware of any other headless Shopify sites quite like this.
If you know of any, are working on one, or would like to build one, please get
in contact with us! We'd love to compare notes :)

For more info on the headless pattern, have a look at [Pantheon's
writeup](https://pantheon.io/decoupled-cms), as well as anything on the
[Contentful blog](https://www.contentful.com/blog/).
