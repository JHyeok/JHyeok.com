const path = require(`path`);
const _ = require('lodash');
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.createPages = ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions;

  createRedirect({
    fromPath: 'https://jhyeok.netlify.com/*',
    toPath: 'https://jhyeok.com/:splat',
    statusCode: 301,
  });

  const blogPost = path.resolve(`./src/templates/blog-post.js`);
  const blogTag = path.resolve(`./src/templates/tags.js`);
  const blogList = path.resolve(`./src/templates/blog-list.js`);
  return graphql(
    `
      {
        allMarkdownRemark(
          sort: { frontmatter: { date: DESC } }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
        tagsGroup: allMarkdownRemark(limit: 2000) {
          group(field: { frontmatter: { tags: SELECT } }) {
            fieldValue
          }
        }
      }
    `
  ).then((result) => {
    if (result.errors) {
      throw result.errors;
    }

    // Create blog posts pages.
    const posts = result.data.allMarkdownRemark.edges;

    posts.forEach((post, index) => {
      const previous =
        index === posts.length - 1 ? null : posts[index + 1].node;
      const next = index === 0 ? null : posts[index - 1].node;

      createPage({
        path: post.node.fields.slug,
        component: blogPost,
        context: {
          slug: post.node.fields.slug,
          previous,
          next,
        },
      });
    });

    // Create blog tags.
    const tags = result.data.tagsGroup.group;

    tags.forEach((tag) => {
      createPage({
        path: `/tags/${_.kebabCase(tag.fieldValue)}/`,
        component: blogTag,
        context: {
          tag: tag.fieldValue,
        },
      });
    });

    // Create blog post list pages.
    const postsPerPage = 10;
    const numPages = Math.ceil(posts.length / postsPerPage);

    createPage({
      path: `/`,
      component: blogList,
      context: {
        limit: postsPerPage,
        skip: 0,
        numPages,
        currentPage: 1,
      },
    });

    Array.from({ length: numPages }).forEach((_, i) => {
      createPage({
        path: `/pages/${i + 1}`,
        component: blogList,
        context: {
          limit: postsPerPage,
          skip: i * postsPerPage,
          numPages,
          currentPage: i + 1,
        },
      });
    });

    return null;
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};
