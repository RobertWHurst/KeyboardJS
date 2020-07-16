import './Navigation.styl'
import React from 'react'
import { InstallCopyBox } from './InstallCopyBox'

export const Navigation = (): JSX.Element => {
  return (
    <aside className='navigation' aria-label='sidebar'>
      <h1 className='navigation__brand'>
        KeyboardJS
      </h1>
      <div className='navigation__brand-sub-content' role='none' aria-hidden>
        <div className='navigation__build-status'>
          <a href='http://github.com/RobertWHurst/KeyboardJS/actions' target='_blank' rel='noreferrer'>
            <img src='http://img.shields.io/github/workflow/status/RobertWHurst/KeyboardJS/Unit%20Tests.svg?style=flat&labelColor=aaa' alt='' />
          </a>
        </div>
        <div className='navigation__download-status'>
          <a href='http://npmjs.com/package/keyboardjs' target='_blank' rel='noreferrer'>
            <img src='http://img.shields.io/npm/dm/keyboardjs.svg?style=flat&labelColor=aaa' alt='' />
          </a>
        </div>
      </div>
      <InstallCopyBox />
      <nav className='navigation__links' />
    </aside>
  )
}
