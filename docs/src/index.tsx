import './index.styl'
import React from 'react'
import { Router } from '@reach/router'
import { render } from 'react-dom'
import { Introduction } from './views/Introduction'

const App = (
  <Router id="router">
    <Introduction path="/"></Introduction>
  </Router>
)

render(App, document.getElementById('app'))
