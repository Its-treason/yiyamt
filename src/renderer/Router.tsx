import { MemoryRouter, Routes, Route } from 'react-router-dom';
import OpenFile from './openFile/OpenFile';
import EditFiles from './editFiles/EditFiles';

export default function Router() {
  return (
    <MemoryRouter>
      <Routes>
        <Route path={'/'} element={<OpenFile />} />
        <Route path={'/editFiles'} element={<EditFiles />} />
      </Routes>
    </MemoryRouter>
  );
}
