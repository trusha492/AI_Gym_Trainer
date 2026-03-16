// DashboardPage.jsx
import Dashboard from '../components/Dashboard';
import Chatbot from '../components/Chatbot';

export default function DashboardPage() {
  return (
    <div className="h-screen flex">
      {/* Left: static dashboard */}
      <div className="w-1/2 h-full overflow-hidden bg-gray-50">
        <Dashboard /> {/* cards for weight, BMI, calories, etc. */}
      </div>

      {/* Right: chatbot area, scrolls only inside */}
      <div className="w-1/2 h-full border-l">
        <div className="h-full flex flex-col">
          {/* Chat header (optional) */}
          <div className="p-3 border-b font-semibold">Chatbot</div>

          {/* Scrollable chat messages */}
          <div className="flex-1 overflow-y-auto">
            <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );
}
