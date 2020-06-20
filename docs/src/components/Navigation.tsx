import './Navigation.styl'
import React from 'react'
import { InstallCopyBox } from './InstallCopyBox'

export const Navigation = (): JSX.Element => {
  return (
    <div className='navigation'>
      <div className='navigation__brand'>
        KeyboardJS
      </div>
      <div className='navigation__brand-sub-content'>
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
    </div>
  )
}
