
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import React from 'react'
import 'uno.css'
const rootEl = document.getElementById('root')!  // 非空断言很重要
ReactDOM.createRoot(rootEl).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)