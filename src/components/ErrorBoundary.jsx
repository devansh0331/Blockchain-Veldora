// components/ErrorBoundary.jsx
import { useRouteError } from "react-router-dom";

export default function ErrorBoundary() {
  const error = useRouteError();
  const { darkMode } = useTheme();

  return (
    <div
      className={`p-8 rounded-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg`}
    >
      <h1
        className={`text-2xl font-bold mb-4 ${
          darkMode ? "text-red-400" : "text-red-600"
        }`}
      >
        Something went wrong
      </h1>
      <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
        {error.message || error.statusText}
      </p>
    </div>
  );
}
