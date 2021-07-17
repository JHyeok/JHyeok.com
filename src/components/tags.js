import React from 'react'
import { capitalize } from '../utils/string'
import { Link } from 'gatsby'
import kebabCase from 'lodash/kebabCase'

import './tags.css'

function cssSafe(str) {
  return encodeURIComponent(str.toLowerCase()).replace(/%[0-9A-F]{2}/gi, '')
}

const Tags = ({ items }) => {
  return (
    <div className="pills">
      {(items || []).map((item) => (
        <span
          className={`pill pill--${cssSafe(item)}`}
          key={item}
          style={{ marginRight: 10 }}
        >
          <Link to={`/tags/${kebabCase(item)}`}>{capitalize(item)}</Link>
        </span>
      ))}
    </div>
  )
}

export default Tags
