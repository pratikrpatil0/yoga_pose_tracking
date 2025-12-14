import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SessionList from "./components/SessionList";
import YogaSession from "./components/YogaSession";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";

function App() {

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <Navigation />
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sessions" element={<SessionList />} />
          <Route path="/session/:sessionId" element={<YogaSession />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
