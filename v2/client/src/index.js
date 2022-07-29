import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from "./Home.js";
import { 
  BrowserRouter,
  Routes,
  Route } from "react-router-dom";

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/example" element={<p>Example branch path</p>} />
          <Route path="*" element={<p>Unable to find Route!</p>}/>
        </Routes>
      </BrowserRouter>
    )
  }
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
