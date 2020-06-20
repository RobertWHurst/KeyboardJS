import './Introduction.styl'
import React from 'react'
import { MainLayout } from '../layouts/MainLayout'
import { Keyboard } from '../components/Keyboard'
import { PressedKeys } from '../components/PressedKeys'

export const Introduction = (): JSX.Element => {
  return (
    <MainLayout>
      <div className='introduction'>
        <div className='introduction__hero-section'>
          <PressedKeys />
          <div className='introduction__hero-section-text'>
            Build your app, I&apos;ll handle the keys
          </div>
          <Keyboard />
        </div>
        <div className='introduction__text-block' />
      </div>
    </MainLayout>
  )
}
