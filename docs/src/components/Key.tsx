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

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [docIsClicked, setDocIsClicked] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);

  const isActiveViaMouse = isHovered && docIsClicked;

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const bindMouseUpAndDown = () => {
    const handleMouseDown = () => {
      setDocIsClicked(true)
    };
    const handleMouseUp = () => {
      setDocIsClicked(false)
    };
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  };

  const watchKeyPresses = () => {
    const handleKeyPress = (event: any) => {
      setIsPressed(event.pressedKeys.includes(keyName))
    };
    keyboardJs.bind(handleKeyPress, handleKeyPress)
    return () => {
      keyboardJs.unbind(handleKeyPress, handleKeyPress)
    }
  };

  const watchMouse = () => {
    isActiveViaMouse
      ? keyboardJs.pressKey(keyName)
      : keyboardJs.releaseKey(keyName)
  };

  const watchKey = () => {
    if (isPressed) {
      onPress();
    }
  };

  useEffect(bindMouseUpAndDown, [])
  useEffect(watchKeyPresses, [])
  useEffect(watchMouse, [isActiveViaMouse])
  useEffect(watchKey, [isPressed])

  return (
    <div
      className={classNames('key', {
        'key--active': isPressed,
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
      }, className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label}
    </div>
  )
}
