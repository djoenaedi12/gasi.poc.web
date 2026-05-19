import React from 'react';

export function ExampleWidget() {
  return (
    <div style={{
      padding: '16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      background: '#f8fafc',
    }}>
      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
        🧩 Example Plugin Widget
      </h3>
      <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#64748b' }}>
        Widget ini di-load dari plugin-example.umd.js
      </p>
    </div>
  );
}
