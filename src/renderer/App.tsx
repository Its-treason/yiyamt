import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import Router from './Router';

export default function App() {
  return (
    <MantineProvider withNormalizeCSS>
      <NotificationsProvider>
        <Router />
      </NotificationsProvider>
    </MantineProvider>
  );
}
