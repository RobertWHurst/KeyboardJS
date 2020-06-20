import './InstallCopyBox.styl'
import React, { useState, MouseEvent, useEffect } from 'react'
import writeText from 'copy-to-clipboard'

const COPIED_BUBBLE_ANIMATION_LENGTH_MS = 1000 * 2

export const InstallCopyBox = (): JSX.Element => {
  const [tab, setTab] = useState('yarn')
  const [isCopied, setIsCopied] = useState(false)

  let isCopiedTimeoutId
  const handleClick = (e: MouseEvent<HTMLInputElement>): void => {
    e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
    writeText(e.currentTarget.value)
    setIsCopied(true)

    clearTimeout(isCopiedTimeoutId)
    isCopiedTimeoutId = setTimeout(() => {
      setIsCopied(false)
    }, COPIED_BUBBLE_ANIMATION_LENGTH_MS)
  }

  const clearIsCopiedTimeoutId = () => () => {
    clearTimeout(isCopiedTimeoutId)
  }

  useEffect(clearIsCopiedTimeoutId, [])

  return (
    <div className="install-copy-box">
      <div className="install-copy-box__tabs">
        <div className="install-copy-box__tab install-copy-box__label">Install with</div>
        <div className="install-copy-box__tab install-copy-box__tab--yarn" onClick={() => setTab('yarn')}>Yarn</div>
        <div className="install-copy-box__tab install-copy-box__label">or</div>
        <div className="install-copy-box__tab install-copy-box__tab--npm" onClick={() => setTab('npm')}>NPM</div>
      </div>
      <div className="install-copy-box__content">
        {isCopied && (
          <div className="install-copy-box__copied-bubble">
            <div className="install-copy-box__copied-bubble-inner">
              Copied!
            </div>
          </div>
        )}
        <input
          type="text"
          value={tab === 'yarn' ? 'yarn add keyboardjs' : 'npm install keyboardjs --save'}
          onChange={e => { e.preventDefault() }}
          onClick={handleClick}
        />
      </div>
    </div>
  )
}
