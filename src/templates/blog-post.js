import { Link, graphql } from 'gatsby';
import React from 'react';

import Bio from '../components/bio';
import { Giscus } from '../components/giscus';
import Layout from '../components/layout';
import SEO from '../components/seo';
import { formatReadingTime } from '../utils/helper';
import { rhythm, scale } from '../utils/typography';

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark;
    const metaData = this.props.data.site.siteMetadata;
    const { title, comment } = metaData;
    const { giscus } = comment;
    const { previous, next } = this.props.pageContext;

    return (
      <Layout location={this.props.location} title={title}>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <h1>{post.frontmatter.title}</h1>
        <p
          style={{
            ...scale(-1 / 5),
            display: 'block',
            marginBottom: rhythm(1),
            marginTop: rhythm(-0.8),
          }}
        >
          {post.frontmatter.date}
          <small
            style={{
              marginLeft: rhythm(1 / 4),
              marginRight: rhythm(1 / 4),
            }}
          >
            •
          </small>
          {formatReadingTime(post.timeToRead)}
        </p>
        <div
          style={{
            marginBottom: rhythm(1),
            marginTop: rhythm(-0.8),
          }}
        ></div>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr
          style={{
            marginBottom: rhythm(1),
            marginTop: rhythm(1),
          }}
        />
        <h3
          style={{
            fontFamily: 'Montserrat, sans-serif',
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: '#43853d',
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h3>
        <Bio />

        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            listStyle: 'none',
            padding: 0,
            marginTop: rhythm(1.5),
            marginLeft: 0,
            marginRight: 0,
            fontSize: '12px',
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
        {!!giscus && <Giscus repo={giscus} />}
      </Layout>
    );
  }
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        comment {
          giscus
        }
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`;
