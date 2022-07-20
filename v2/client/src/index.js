import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { 
  BrowserRouter,
  Routes,
  Route } from "react-router-dom";

class App extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<p>Home page</p>} />
          <Route path="/example" element={<p>Example branch path</p>} />
          <Route path="*" element={<p>Unable to find Route!</p>}/>
        </Routes>
      </BrowserRouter>
    )
  }
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
