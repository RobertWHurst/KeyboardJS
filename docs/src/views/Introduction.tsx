import './Introduction.styl'
import React from 'react'
import { MainLayout } from '../layouts/MainLayout'
import { Keyboard } from '../components/Keyboard'
import { PressedKeys } from '../components/PressedKeys'

export const Introduction = (): JSX.Element => {
  return (
    <MainLayout>
      <div className='introduction'>
        <div className='introduction__hero-section' aria-role='none' aria-hidden>
          <PressedKeys />
          <div className='introduction__hero-section-text'>
            Build your app, I'll handle the keys
          </div>
          <Keyboard />
        </div>
        <article className='introduction__text-block' aria-label='introduction'>
          <p>
            KeyboardJS enables web developers to build applications with quality
            keyboard integrations without needing to spend hours hand crafting
            custom event handlers for things like key combos.
          </p>
          <p>
            KeyboardJS makes it very easy to bind keys, and key combos to
            application behaviour, and should be easy to understand even for
            novice programmers.
          </p>
        </article>
        <article className='introduction__text-block' aria-label='getting started'>
          <h1>Getting Started</h1>
          <p>
            First you'll need add KeyboardJS to your project. There are a
            few aways to source the library. It can be found on NPM, but you may
            also download a built copy of the library.
          </p>
          <p>
            If you want to source KeyboardJS from NPM, and add it as a
            dependency of your project you may do so with one the following
            commands. Pick one based on your your preference of NPM client.
          </p>
          <code aria-label='install with npm example'>
            <pre>
              npm install keyboardjs
            </pre>
          </code>
          <code aria-label='install with yarn example'>
            <pre>
              yarn add keyboardjs
            </pre>
          </code>
          <p>To use KeyboardJS simply import it into your project</p>
          <code aria-label='import package example'>
            <pre>
              import keyboardJS from &quot;keyboardjs&quot;;<br /><br />
              keyboardJS.bind('a', () ={'>'} {'{'} console.log('a key pressed'); {'}'});
            </pre>
          </code>
          <p>
            If you do not want to use NPM, you can download a copy of KeyboardJS
            instead. The library is built as a UMD bundle so it can be used in
            a veriety of situations.
          </p>
          <a href='https://github.com/RobertWHurst/KeyboardJS/tree/master/dist' rel='noreferrer' target='_blank'>Download KeyboardJS</a>
          <p>
            Add your copy of keyboardJS your project with a script tag.
          </p>
          <code aria-label='install with yarn'>
            <pre>
              {'<'}script src="keyboard.js{'"'}{'>'}{'<'}/script{'>'}<br />
              {'<'}script{'>'}<br />
              {'\t'}keyboardJS.bind('a', () ={'>'} {'{'} console.log('a key pressed'); {'}'});<br />
              {'<'}/script{'>'}
            </pre>
          </code>
        </article>
      </div>
    </MainLayout>
  )
}
