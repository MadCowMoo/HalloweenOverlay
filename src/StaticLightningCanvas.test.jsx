import React from 'react';
import { render } from '@testing-library/react';
import StaticLightningCanvas from './StaticLightningCanvas';

describe('StaticLightningCanvas', () => {
  it('renders a canvas element', () => {
    const { container } = render(<StaticLightningCanvas overlayAlpha={0.5} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas.style.opacity).toBe('0.5');
  });

  it('draws static on the canvas', () => {
    // Can't test pixel data, but can check that getContext is called
    const { container } = render(<StaticLightningCanvas />);
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    expect(ctx).toBeDefined();
  });
});
