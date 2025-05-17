import { Link, graphql } from 'gatsby';
import React from 'react';

import Bio from '../components/bio';
import Layout from '../components/layout';
import SEO from '../components/seo';
import { formatReadingTime } from '../utils/helper';
import { rhythm } from '../utils/typography';

class BlogIndex extends React.Component {
  render() {
    const { data, location } = this.props;
    const siteTitle = data.site.siteMetadata.title;
    const posts = data.allposts.edges;

    return (
      <Layout location={location} title={siteTitle}>
        <SEO
          title="Blog"
          keywords={[
            `blog`,
            `development`,
            `backend`,
            `nodejs`,
            `typescript`,
            `javascript`,
            `expressjs`,
            `nestjs`,
            `dotnet`,
            `dotnetcore`,
            `entityframework`,
            `c#`,
            `python`,
          ]}
        />
        <Bio />
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug;
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
              <small>{node.frontmatter.date}</small>
              <small
                style={{
                  marginLeft: rhythm(1 / 4),
                  marginRight: rhythm(1 / 4),
                }}
              >
                •
              </small>
              <small>{formatReadingTime(node.timeToRead)}</small>
              <p
                dangerouslySetInnerHTML={{
                  __html: node.frontmatter.description || node.excerpt,
                }}
              />
            </div>
          );
        })}
      </Layout>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allposts: allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
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
          }
        }
      }
    }
  }
`;
