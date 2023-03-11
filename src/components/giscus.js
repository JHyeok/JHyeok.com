import React, { useEffect } from 'react';

export const Giscus = ({ repo }) => {
  const rootElm = React.createRef();

  useEffect(() => {
    console.log(repo);
    const isDarkTheme = document
      .querySelector('body')
      .classList.contains('dark');
    const giscus = document.createElement('script');
    const giscusConfig = {
      src: 'https://giscus.app/client.js',
      'data-repo': repo,
      'data-repo-id': 'MDEwOlJlcG9zaXRvcnkxODA2MTAxMDc=',
      'data-category': 'Comments',
      'data-category-id': 'DIC_kwDOCsPkO84CUrSS',
      'data-mapping': 'pathname',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': isDarkTheme ? 'dark_dimmed' : 'light_high_contrast',
      'data-lang': 'ko',
      'data-loading': 'lazy',
      crossorigin: 'anonymous',
      async: true,
    };

    Object.keys(giscusConfig).forEach((configKey) => {
      giscus.setAttribute(configKey, giscusConfig[configKey]);
    });
    rootElm.current.appendChild(giscus);
  }, []);

  return <div className="giscus" ref={rootElm} />;
};
