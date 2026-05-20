import React from 'react';

export function ExampleListPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
        Example List
      </h1>
      <p style={{ color: '#64748b' }}>
        Halaman ini di-render oleh plugin-example melalui ROUTE extension point.
      </p>
    </div>
  );
}

export function ExampleFormPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
        Example Form
      </h1>
      <p style={{ color: '#64748b' }}>
        Form page dari plugin-example.
      </p>
    </div>
  );
}
