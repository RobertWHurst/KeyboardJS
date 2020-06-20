import './Keyboard.styl'
import React, { useRef, useEffect } from 'react'
import { Key } from './Key'
import clickAudioFilePath from '../audio/click.wav'

class AudioPool {
  private _canPlay: boolean;
  private _canPlayTimeoutId: number;
  private _currentIndex: number;
  private _audioEls: HTMLAudioElement[]

  constructor () {
    this._currentIndex = 0
    this._audioEls = []
    this._canPlay = true
    this._canPlayTimeoutId = 0

    this._createElements(6)
  }

  public play () {
    if (!this._canPlay) {
      return
    }

    const index = this._currentIndex
    this._currentIndex += 1
    this._currentIndex %= this._audioEls.length - 1
    this._audioEls[index].play()
    this._canPlay = false

    clearTimeout(this._canPlayTimeoutId)
    this._canPlayTimeoutId = setTimeout(() => {
      this._canPlay = true
    }, 10)
  }

  private _createElements (count: number) {
    this._audioEls.length = 0
    for (let i = 0; i < count; i += 1) {
      const audioEl = new Audio(clickAudioFilePath)
      this._audioEls.push(audioEl)
    }
  }
}

export const Keyboard = (): JSX.Element => {
  const audioPoolRef = useRef<AudioPool | null>(null)

  const playClick = () => {
    if (!audioPoolRef.current) {
      return
    }
    audioPoolRef.current.play()
  }

  const createAudioPool = () => {
    audioPoolRef.current = new AudioPool()
  }

  useEffect(createAudioPool, [])

  return (
    <div className='keyboard'>
      <div className='keyboard__inner'>
        <div className='keyboard__row keyboard__row--first'>
          <Key onPress={playClick} label='ESC' keyName='esc' />
          <Key onPress={playClick} label='F1' keyName='f1' />
          <Key onPress={playClick} label='F2' keyName='f2' />
          <Key onPress={playClick} label='F3' keyName='f3' />
          <Key onPress={playClick} label='F4' keyName='f4' />
          <Key onPress={playClick} label='F5' keyName='f5' />
          <Key onPress={playClick} label='F6' keyName='f6' />
          <Key onPress={playClick} label='F7' keyName='f7' />
          <Key onPress={playClick} label='F8' keyName='f8' />
          <Key onPress={playClick} label='F9' keyName='f9' />
          <Key onPress={playClick} label='F10' keyName='f10' />
          <Key onPress={playClick} label='F11' keyName='f11' />
          <Key onPress={playClick} label='F12' keyName='f12' />
        </div>
        <div className='keyboard__row'>
          <Key onPress={playClick} label='`~' keyName='`' />
          <Key onPress={playClick} label='1!' keyName='1' />
          <Key onPress={playClick} label='2@' keyName='2' />
          <Key onPress={playClick} label='3#' keyName='3' />
          <Key onPress={playClick} label='4$' keyName='4' />
          <Key onPress={playClick} label='5%' keyName='5' />
          <Key onPress={playClick} label='6^' keyName='6' />
          <Key onPress={playClick} label='7&' keyName='7' />
          <Key onPress={playClick} label='8*' keyName='8' />
          <Key onPress={playClick} label='9(' keyName='9' />
          <Key onPress={playClick} label='0)' keyName='0' />
          <Key onPress={playClick} label='-_' keyName='-' />
          <Key onPress={playClick} label='=+' keyName='=' />
          <Key onPress={playClick} label='⟵' keyName='backspace' />
        </div>
        <div className='keyboard__row'>
          <Key onPress={playClick} label='TAB' keyName='tab' />
          <Key onPress={playClick} label='Q' keyName='q' />
          <Key onPress={playClick} label='W' keyName='w' />
          <Key onPress={playClick} label='E' keyName='e' />
          <Key onPress={playClick} label='R' keyName='r' />
          <Key onPress={playClick} label='T' keyName='t' />
          <Key onPress={playClick} label='Y' keyName='y' />
          <Key onPress={playClick} label='U' keyName='u' />
          <Key onPress={playClick} label='I' keyName='i' />
          <Key onPress={playClick} label='O' keyName='o' />
          <Key onPress={playClick} label='P' keyName='p' />
          <Key onPress={playClick} label='[{' keyName='[' />
          <Key onPress={playClick} label=']}' keyName=']' />
          <Key onPress={playClick} label='\|' keyName='\' />
        </div>
        <div className='keyboard__row'>
          <Key onPress={playClick} label='CAPS' keyName='capslock' />
          <Key onPress={playClick} label='A' keyName='a' />
          <Key onPress={playClick} label='S' keyName='s' />
          <Key onPress={playClick} label='D' keyName='d' />
          <Key onPress={playClick} label='F' keyName='f' />
          <Key onPress={playClick} label='G' keyName='g' />
          <Key onPress={playClick} label='H' keyName='h' />
          <Key onPress={playClick} label='J' keyName='j' />
          <Key onPress={playClick} label='K' keyName='k' />
          <Key onPress={playClick} label='L' keyName='l' />
          <Key onPress={playClick} label=';:' keyName=';' />
          <Key onPress={playClick} label={'\'"'} keyName="'" />
          <Key onPress={playClick} label='ENTER↵' keyName='enter' />
        </div>
        <div className='keyboard__row'>
          <Key onPress={playClick} className='key--left-shift' label='SHIFT' keyName='shift' />
          <Key onPress={playClick} label='Z' keyName='z' />
          <Key onPress={playClick} label='X' keyName='x' />
          <Key onPress={playClick} label='C' keyName='c' />
          <Key onPress={playClick} label='V' keyName='v' />
          <Key onPress={playClick} label='B' keyName='b' />
          <Key onPress={playClick} label='N' keyName='n' />
          <Key onPress={playClick} label='M' keyName='m' />
          <Key onPress={playClick} label=',<' keyName=',' />
          <Key onPress={playClick} label='.>' keyName='.' />
          <Key onPress={playClick} label='/?' keyName='/' />
          <Key onPress={playClick} className='key--right-shift' label='SHIFT' keyName='shift' />
        </div>
        <div className='keyboard__row keyboard__row--last'>
          <Key onPress={playClick} label='CTRL' keyName='ctrl' />
          <Key onPress={playClick} label='❖' keyName='super' />
          <Key onPress={playClick} label='ALT' keyName='alt' />
          <Key onPress={playClick} keyName='space' />
          <Key onPress={playClick} label='ALT' keyName='alt' />
          <Key onPress={playClick} label='CTRL' keyName='ctrl' />
          <div className='keyboard__arrows'>
            <div className='keyboard__row'>
              <Key onPress={playClick} label='🡅' keyName='up' />
            </div>
            <div className='keyboard__row'>
              <Key onPress={playClick} label='🡄' keyName='left' />
              <Key onPress={playClick} label='🡇' keyName='down' />
              <Key onPress={playClick} label='🡆' keyName='right' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
