import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const suppressedMessages = [
  'cdn.tailwindcss.com should not be used in production.',
  'Download the React DevTools'
];

const shouldSuppress = (args: unknown[]) =>
  args.some(
    (arg) =>
      typeof arg === 'string' &&
      suppressedMessages.some((message) => arg.includes(message))
  );

const wrapConsole =
  (method: (...args: unknown[]) => void) =>
  (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
    method(...args);
  };

console.warn = wrapConsole(console.warn.bind(console));
console.info = wrapConsole((console.info || console.log).bind(console));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
