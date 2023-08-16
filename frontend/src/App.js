import { Routes, Route } from 'react-router-dom';

import Markdowns from './Pages/Markdowns/Markdowns';
import BaseHome from './Pages/Homes/BaseHome';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/markdowns" element={<Markdowns />} />
        <Route path="*" element={<BaseHome />} />
      </Routes>
    </div>
  );
}

export default App;
