export type NoticeState =
  | { kind: 'success'; text: string }
  | { kind: 'error'; status: number; messages: string[] }
  | null;

interface NoticeProps {
  notice: NoticeState;
  onClose: () => void;
}

/** Mensaje de éxito o de error del servidor tras una operación. */
export function Notice({ notice, onClose }: NoticeProps) {
  if (!notice) return null;

  if (notice.kind === 'success') {
    return (
      <div className="notice notice-success" role="status">
        <p>{notice.text}</p>
        <button type="button" className="link" onClick={onClose} aria-label="Cerrar mensaje">
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="notice notice-error" role="alert">
      <div>
        <p className="notice-title">
          {notice.status === 0 ? 'Sin conexión' : `El servidor respondió ${notice.status}`}
        </p>
        <ul>
          {notice.messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </div>
      <button type="button" className="link" onClick={onClose} aria-label="Cerrar mensaje">
        ×
      </button>
    </div>
  );
}
