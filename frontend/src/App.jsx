import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { UserProvider } from './context/UserContext';

// Common
import Header from './components/Header';
import Footer from './components/Footer';

// Pages - Website
import Landing from './pages/Landing';
import EventHome from './components/EventHome';
import AgendaList from './components/AgendaList';
import EventDetails from './components/EventDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import RegistrationForm from './components/RegistrationForm';
import QRDisplay from './components/QRDisplay';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/events" element={<EventHome />} />
            <Route path="/agenda/:eventId" element={<AgendaList />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/register/:masterclassId" element={<RegistrationForm />} />
            <Route path="/qr/:registrationId" element={<QRDisplay />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default function AppWithProvider() {
  return (
    <UserProvider>
      <App />
    </UserProvider>
  );
}
