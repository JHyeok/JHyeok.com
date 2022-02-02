import Typography from 'typography';
import Wordpress2016 from 'typography-theme-wordpress-2016';

import './global.css';

Wordpress2016.overrideThemeStyles = ({ rhythm }) => ({
  a: {
    color: '#43853d',
  },
  'a.gatsby-resp-image-link': {
    boxShadow: 'none',
  },
  hr: {
    background: 'var(--hr)',
  },
  'h1 code, h2 code, h3 code, h4 code, h5 code, h6 code': {
    fontSize: 'inherit',
  },
  'p code': {
    fontSize: '1rem',
  },
  'li code': {
    fontSize: '1rem',
  },
  blockquote: {
    color: 'inherit',
    borderLeftColor: 'inherit',
    opacity: '0.8',
  },
  'blockquote.translation': {
    fontSize: '1em',
  },
  'ol,ul': {
    marginLeft: rhythm(1.25),
  },
  'li>ol,li>ul': {
    marginLeft: rhythm(1.25),
  },
});

delete Wordpress2016.googleFonts;

const typography = new Typography(Wordpress2016);

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles();
}

export default typography;
export const rhythm = typography.rhythm;
export const scale = typography.scale;
