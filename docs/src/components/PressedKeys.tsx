import './PressedKeys.styl'
import React, { useState, useEffect } from 'react'

import keyboardJs from 'keyboardjs'

export const PressedKeys = () => {
  const [pressedKeys, setPressedKeys] = useState<string[]>([])

  const bindAnyKeyPress = () => {
    const handleKeyPress = (event: any) => {
      setPressedKeys(event.pressedKeys)
    }

    keyboardJs.bind(handleKeyPress, handleKeyPress)
    return () => {
      keyboardJs.unbind(handleKeyPress, handleKeyPress)
    }
  }

  useEffect(bindAnyKeyPress, [])

  return (
    <div className='pressed-keys'>
      {pressedKeys.map(k => (
        <div key={k} className='pressed-keys__key'>
          {k}
        </div>
      ))}
    </div>
  )
}
