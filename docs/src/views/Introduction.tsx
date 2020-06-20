import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { MainLayout } from '../layouts/MainLayout'

export const Introduction = (props: RouteComponentProps): JSX.Element => {
  return (
    <MainLayout>
      <div className="introduction">
        <div className="introduction__hero-section">
          <div className="introduction__hero-section-text">
            Build your app, I&apos;ll handle the keys
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
