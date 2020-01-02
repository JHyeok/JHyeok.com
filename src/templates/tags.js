import React from "react"
import { Link, graphql } from "gatsby"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Tags from "../components/tags"
import TagList from "../components/tag-list"
import { rhythm } from "../utils/typography"
import { formatReadingTime } from "../utils/helper"

class TagsIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const allTags = data.alltags.group
    const posts = data.filteredposts.edges

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title="Blog"
          keywords={[`blog`, `backend`, `javascript`, `dotnet`, `dotnetcore`, `entityframework`, `development`, `c#`, `python`, `nodejs`]}
        />
        <Bio />

        <TagList items={allTags} />

        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return (
            <div key={node.fields.slug}>
              <h2
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                  {title}
                </Link>
              </h2>
              <small>
                {node.frontmatter.date}
              </small>
              <small style={{
                marginLeft: rhythm(1 / 4),
                marginRight: rhythm(1 / 4),
              }}>
                •
              </small>
              <small>
                {formatReadingTime(node.timeToRead)}
              </small>
              <Tags items={node.frontmatter.tags} />
              <p
                dangerouslySetInnerHTML={{
                  __html: node.frontmatter.description || node.excerpt,
                }}
              />
            </div>
          )
        })}
      </Layout>
    )
  }
}

export default TagsIndex

export const pageQuery = graphql`
  query($tag: String) {
    site {
      siteMetadata {
        title
      }
    }
    alltags: allMarkdownRemark(limit: 2000) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
    filteredposts: allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          timeToRead
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            tags
          }
        }
      }
    }
  }
`