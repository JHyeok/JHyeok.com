import { Link } from 'gatsby';
import React from 'react';

export default function PageNav({ prevPage, nextPage, isFirst, isLast }) {
  return (
    <nav>
      <ul
        style={{
          display: `flex`,
          flexWrap: `wrap`,
          justifyContent: `space-between`,
          listStyle: `none`,
          padding: 0,
          marginLeft: 0,
        }}
      >
        <li>
          {!isFirst && (
            <Link to={'/pages/' + prevPage} rel="prev">
              ← Prev Page
            </Link>
          )}
        </li>
        <li>
          {!isLast && (
            <Link to={'/pages/' + nextPage} rel="next">
              Next Page →
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
