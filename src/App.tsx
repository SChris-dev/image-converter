import ImageConverter from "./components/ImageConverter";
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <main className="min-h-screen flex items-center justify-center bg-gray-700">
        <ImageConverter />
      </main>
    </>
  );
}

export default App;
