import './MainLayout.styl'
import React, { ReactNode } from 'react'
import { Navigation } from '../components/Navigation'

interface Props {
  children: ReactNode
}

export const MainLayout = (props: Props): JSX.Element => {
  const { children } = props

  return (
    <div className="main-layout">
      <Navigation />
      <div className="main-layout__content">
        {children}
      </div>
    </div>
  )
}
