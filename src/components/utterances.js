import React, { useEffect } from "react"

const src = "https://utteranc.es/client.js"
const label = "Comment"

export const Utterances = ({ repo }) => {
  const rootElm = React.createRef()

  useEffect(() => {
    const utterances = document.createElement("script")
    const utterancesConfig = {
      src,
      repo,
      "issue-term": "pathname",
      label,
      theme: "github-light",
      crossorigin: "anonymous",
      async: true,
    }

    Object.keys(utterancesConfig).forEach(configKey => {
      utterances.setAttribute(configKey, utterancesConfig[configKey])
    })
    rootElm.current.appendChild(utterances)
  }, [])

  return <div className="utterences" ref={rootElm} />
}