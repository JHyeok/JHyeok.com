import React, { useEffect } from "react"

export const Utterances = ({ repo }) => {
  const rootElm = React.createRef()

  useEffect(() => {
    const utterances = document.createElement("script")
    const utterancesConfig = {
      src: "https://utteranc.es/client.js",
      repo,
      "issue-term": "pathname",
      label: "comment",
      theme: "github-light",
      crossorigin: "anonymous",
      async: true,
    }

    Object.keys(utterancesConfig).forEach(configKey => {
      utterances.setAttribute(configKey, utterancesConfig[configKey])
    })
    rootElm.current.appendChild(utterances)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div className="utterences" ref={rootElm} />
}