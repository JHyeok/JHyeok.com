import { Link, graphql } from 'gatsby';
import React from 'react';

import Bio from '../components/bio';
import Layout from '../components/layout';
import PageNav from '../components/page-nav';
import SEO from '../components/seo';
import TagList from '../components/tag-list';
import Tags from '../components/tags';
import { formatReadingTime } from '../utils/helper';
import { rhythm } from '../utils/typography';

class BlogIndex extends React.Component {
  render() {
    const { data, location } = this.props;
    const siteTitle = data.site.siteMetadata.title;
    const allTags = data.alltags.group;
    const posts = data.allposts.edges;
    const { currentPage, numPages } = this.props.pageContext;
    const isFirst = currentPage === 1;
    const isLast = currentPage === numPages;
    const prevPage = (currentPage - 1).toString();
    const nextPage = (currentPage + 1).toString();

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
            `dotnet`,
            `dotnetcore`,
            `entityframework`,
            `c#`,
            `python`,
          ]}
        />
        <Bio />
        <TagList items={allTags} />
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug;
          return (
            <div key={node.fields.slug}>
              <h2
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link style={{ boxShadow: 'none' }} to={node.fields.slug}>
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
              <Tags items={node.frontmatter.tags} />
              <p
                dangerouslySetInnerHTML={{
                  __html: node.frontmatter.description || node.excerpt,
                }}
              />
            </div>
          );
        })}
        <PageNav
          prevPage={prevPage}
          nextPage={nextPage}
          isFirst={isFirst}
          isLast={isLast}
        />
      </Layout>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query ($skip: Int!, $limit: Int!) {
    site {
      siteMetadata {
        title
      }
    }
    alltags: allMarkdownRemark(limit: 2000) {
      group(field: { frontmatter: { tags: SELECT } }) {
        fieldValue
        totalCount
      }
    }
    allposts: allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      limit: $limit
      skip: $skip
    ) {
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
`;
