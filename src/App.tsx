import HomePage from './HomePage'
import './index.css'

function App() {
  return (
    <div className="p-10">
      {/* Tailwind test alanı */}
    <h1 className="text-3xl font-bold text-red-500">Tailwind Çalışıyor</h1>

      {/* Senin gerçek sayfan */}
      <HomePage />
    </div>
  )
}

export default App
