import React from 'react';
import { render } from '@testing-library/react';
import VideoPlayer from './VideoPlayer';

describe('VideoPlayer', () => {
  it('renders playlist video', () => {
    const { container } = render(<VideoPlayer settings={{ playlist: ['foo.mp4'] }} />);
    expect(container.querySelector('video')).toBeInTheDocument();
  });

  it('renders overlay video if overlayFile is set', () => {
    const { container } = render(<VideoPlayer settings={{ overlayFile: new File([], 'bar.mp4') }} />);
    const videos = container.querySelectorAll('video');
    expect(videos.length).toBeGreaterThan(0);
  });

  it('renders StaticLightningCanvas if no overlayFile', () => {
    const { container } = render(<VideoPlayer settings={{}} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });
});
