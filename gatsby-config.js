module.exports = {
  siteMetadata: {
    title: `JHyeok`,
    author: `JaeHyeok Kim`,
    description: `Personal blog by JHyeok`,
    siteUrl: `https://jhyeok.com`,
    social: {
      github: `JHyeok`,
      medium: `@dev.jhyeok`,
    },
    comment: {
      giscus: `JHyeok/JHyeok.com`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-plugin-nprogress`,
      options: {
        color: `tomato`,
        showSpinner: false,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: 'gatsby-plugin-sharp',
      options: {
        stripMetadata: true,
        defaults: {
          quality: 90,
        },
      },
    },
    'gatsby-transformer-sharp',
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1200,
              quality: 90,
              linkImagesToOriginal: false,
            },
          },
          {
            resolve: `gatsby-remark-images-medium-zoom`,
            options: {
              margin: 12,
              scrollOffset: 0,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: `gatsby-remark-external-links`,
            options: {
              target: '_blank',
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-140417715-1`,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
      {
        site {
          siteMetadata {
            title
            description
            siteUrl
            site_url: siteUrl
          }
        }
      }
    `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.nodes.map((node) => ({
                title: node.frontmatter.title,
                description: node.frontmatter.description,
                date: node.frontmatter.date,
                url: site.siteMetadata.siteUrl + node.fields.slug,
                guid: site.siteMetadata.siteUrl + node.fields.slug,
              }));
            },
            query: `
          {
            allMarkdownRemark(
              sort: { frontmatter: { date: DESC } },
            ) {
              nodes {
                fields { 
                  slug 
                }
                frontmatter {
                  title
                  description
                  date
                }
              }
            }
          }
        `,
            output: '/rss.xml',
            title: 'JHyeok Blog\'s RSS Feed',
            match: '^/blog/',
            custom_namespaces: {
              atom: 'http://www.w3.org/2005/Atom',
            },
            custom_elements: [
              { language: 'ko' },
              { ttl: '60' },
              {
                'atom:link': {
                  _attr: {
                    href: 'https://jhyeok.com/rss.xml',
                    rel: 'self',
                    type: 'application/rss+xml',
                  },
                },
              },
            ],
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `JHyeok`,
        short_name: `JHyeok`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/gatsby-icon.png`,
      },
    },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-plugin-cloudflare-pages`,
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        // 모든 페이지를 사전 캐시
        precachePages: [`/`],
        workboxConfig: {
          runtimeCaching: [
            // 이미지, API 응답 및 기타 동적 콘텐츠 캐시
            {
              urlPattern: /^https?:.*\/(wp-content|wp-json).*/,
              handler: `CacheFirst`,
            },
            {
              urlPattern:
                /^https?:.*\.(png|jpg|jpeg|webp|gif|svg|ico|woff|woff2|ttf|otf)$/,
              handler: `CacheFirst`,
            },
            {
              urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
              handler: `StaleWhileRevalidate`,
            },
          ],
        },
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        excludes: [`/dev-404-page`, `/404`, `/404.html`],
      },
    },
  ],
};
