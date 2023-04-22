/**
 * Bio component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */
import { StaticQuery, graphql } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';

function Bio() {
  return (
    <StaticQuery
      query={bioQuery}
      render={(data) => {
        const { author, social } = data.site.siteMetadata;
        return (
          <div className="bio">
            <StaticImage
              className="bio-avatar"
              layout="fixed"
              formats={['auto', 'webp', 'avif']}
              src="../../content/assets/github-profile.png"
              alt={author}
              width={56}
              height={56}
              quality={95}
            />
            <p>
              Written by <strong>{author}</strong>
              <br></br>
              <a href={`https://github.com/${social.github}`}>GitHub</a>
            </p>
          </div>
        );
      }}
    />
  );
}

const bioQuery = graphql`
  query BioQuery {
    site {
      siteMetadata {
        author
        social {
          github
        }
      }
    }
  }
`;

export default Bio;
