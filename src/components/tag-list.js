import React from "react"
import { Link } from "gatsby"
import kebabCase from "lodash/kebabCase"

const TagList = ({ items }) => {
  return (
    <div>
      <Link to="/">ALL</Link>
      {items.map(tag => ( 
        <Link style={{ marginLeft: `20px` }} to={`/tags/${kebabCase(tag.fieldValue)}/`}>
          {tag.fieldValue} ({tag.totalCount})
        </Link>
      ))}
    </div>
  )
}

export default TagList