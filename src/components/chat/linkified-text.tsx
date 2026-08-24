import * as React from 'react'
import { URL_PATTERN } from '@/lib/message'

export interface LinkifiedTextProps {
  text: string
  linkClassName?: string
}

/**
 * Splits message text on URL_PATTERN (the same pattern the media/links
 * panel uses via extractLinks) so a shared message and the panel agree on
 * what counts as a link.
 */
const LinkifiedText = ({ text, linkClassName }: LinkifiedTextProps) => {
  const parts = text.split(URL_PATTERN)
  const urls = text.match(URL_PATTERN) ?? []

  if (urls.length === 0) return <>{text}</>

  return (
    <>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < urls.length && (
            <a
              href={urls[index]}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className={linkClassName ?? 'underline underline-offset-2 hover:opacity-80'}
            >
              {urls[index]}
            </a>
          )}
        </React.Fragment>
      ))}
    </>
  )
}

export { LinkifiedText }
