import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './screens/Home';
import Editor from './screens/Editor';
import PhotoViewer from './screens/PhotoViewer';
import Calendar from './screens/Calendar';
import Settings from './screens/Settings';

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/edit/:mmdd/:year" element={<Editor />} />
        <Route path="/photo/:entryId/:index" element={<PhotoViewer />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
