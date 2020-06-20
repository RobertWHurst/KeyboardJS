import './Key.styl'
import React, { useState, useEffect, useRef } from 'react'
import keyboardJs from 'keyboardjs'
import classNames from 'classnames'

export interface KeyProps {
  className?: string
  label?: string
  keyName: string
  onPress: () => void
}

export const Key = (props: KeyProps): JSX.Element => {
  const { className, label, keyName, onPress } = props
  const [isActive, setIsActive] = useState<boolean>(false)
  const activeRef = useRef(isActive)

  const handleMouseDown = () => {
    keyboardJs.pressKey(keyName)
  }

  const bindMouseUp = () => {
    activeRef.current = isActive

    if (isActive) {
      return
    }

    const handleMouseUp = () => {
      keyboardJs.releaseKey(keyName)
    }

    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }

  const bindAnyKeyPress = () => {
    const handleKeyPress = (event: any) => {
      if ('preventDefault' in event) { event.preventDefault() }
      const isActive = event.pressedKeys.includes(keyName)
      if (!activeRef.current && isActive) {
        onPress()
      }
      setIsActive(isActive)
    }

    keyboardJs.bind(handleKeyPress, handleKeyPress)
    return () => {
      keyboardJs.unbind(handleKeyPress, handleKeyPress)
    }
  }

  useEffect(bindMouseUp, [isActive])
  useEffect(bindAnyKeyPress, [])

  return (
    <div
      className={classNames('key', {
        'key--active': isActive,
        'key--esc': keyName === 'esc',
        'key--f4': keyName === 'f4',
        'key--f8': keyName === 'f8',
        'key--backspace': keyName === 'backspace',
        'key--tab': keyName === 'tab',
        'key--backslash': keyName === 'backslash',
        'key--capslock': keyName === 'capslock',
        'key--enter': keyName === 'enter',
        'key--right-shift': keyName === 'shift',
        'key--left-shift': keyName === 'shift',
        'key--spacebar': keyName === 'space',
        'key--up': keyName === 'up'
      }, className)} onMouseDown={handleMouseDown}
    >
      {label}
    </div>
  )
}
