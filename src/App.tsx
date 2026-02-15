
import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'

export default function App() {
  useEffect(() => {
    WebApp.ready()
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h1>🎮 KL5 Battle</h1>
      <p>Тренажёр для учеников 5 класса</p>

      <h2>📊 Рейтинг</h2>
      <ul>
        <li>1. Аня — 120</li>
        <li>2. Петя — 95</li>
        <li>3. Миша — 80</li>
      </ul>

      <h2>Режимы</h2>
      <button>⚔️ Батл 1 на 1</button><br /><br />
      <button>📘 Ежедневные задания</button><br /><br />
      <button>👑 Королевская битва</button>
    </div>
  )
}
