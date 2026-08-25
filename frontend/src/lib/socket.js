export function createAlertsSocket(onMessage) {
  const configuredBase = import.meta.env.VITE_WS_BASE_URL;
  const fallbackBase = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/v1/ws/alerts`;
  const socketBase = configuredBase
    ? (() => {
        if (configuredBase.startsWith('ws://') || configuredBase.startsWith('wss://')) {
          return configuredBase;
        }

        const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const path = configuredBase.startsWith('/') ? configuredBase : `/${configuredBase}`;
        return `${scheme}://${window.location.host}${path}`;
      })()
    : fallbackBase;
  const ws = new WebSocket(socketBase);
  let opened = false;
  let cancelled = false;
  let flushHandle = 0;
  let pendingMessages = [];

  const flushMessages = () => {
    flushHandle = 0;
    if (cancelled || pendingMessages.length === 0) {
      pendingMessages = [];
      return;
    }

    const batch = pendingMessages;
    pendingMessages = [];
    for (const message of batch) {
      onMessage(message);
    }
  };

  ws.onopen = () => {
    opened = true;
    if (cancelled) {
      ws.close();
      return;
    }
    ws.send('subscribe');
  };

  ws.onerror = () => {};

  ws.onclose = () => {
    opened = false;
  };

  ws.onmessage = (event) => {
    try {
      pendingMessages.push(JSON.parse(event.data));
    } catch {
      pendingMessages.push({ channel: 'raw', payload: event.data });
    }

    if (!flushHandle) {
      flushHandle = window.requestAnimationFrame(flushMessages);
    }
  };

  ws.safeClose = () => {
    cancelled = true;
    if (flushHandle) {
      window.cancelAnimationFrame(flushHandle);
      flushHandle = 0;
    }
    pendingMessages = [];
    if (opened && ws.readyState <= WebSocket.OPEN) {
      ws.close();
    }
  };

  return ws;
}
