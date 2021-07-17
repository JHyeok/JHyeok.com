import React from 'react'
import { Link } from 'gatsby'
import kebabCase from 'lodash/kebabCase'

import './tag-list.css'

const TagList = ({ items }) => {
  return (
    <div className="tag-wrap">
      <div className="tag-item">
        <Link to="/">ALL</Link>
        {items.map((tag) => (
          <Link to={`/tags/${kebabCase(tag.fieldValue)}/`}>
            {tag.fieldValue} ({tag.totalCount})
          </Link>
        ))}
      </div>
    </div>
  )
}

export default TagList
