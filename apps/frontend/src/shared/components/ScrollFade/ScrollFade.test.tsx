import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScrollFade from './ScrollFade';

// jsdom has no layout engine, so scroll metrics read 0. Stub them on the node to
// drive the fade logic, then fire a scroll event to trigger a recompute.
function setMetrics(el: HTMLElement, m: { scrollLeft: number; clientWidth: number; scrollWidth: number }) {
  Object.defineProperty(el, 'scrollLeft', { configurable: true, value: m.scrollLeft });
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: m.clientWidth });
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: m.scrollWidth });
  fireEvent.scroll(el);
}

function setVerticalMetrics(el: HTMLElement, m: { scrollTop: number; clientHeight: number; scrollHeight: number }) {
  Object.defineProperty(el, 'scrollTop', { configurable: true, value: m.scrollTop });
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: m.clientHeight });
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: m.scrollHeight });
  fireEvent.scroll(el);
}

// Overlays are the two aria-hidden divs, in DOM order: [left, right].
function overlays() {
  return Array.from(document.querySelectorAll('div[aria-hidden="true"]')) as HTMLElement[];
}

describe('ScrollFade', () => {
  it('renders children and forwards attributes to the scroll row', () => {
    render(
      <ScrollFade role="tablist" aria-label="props" className="flex gap-2">
        <button>Alpha</button>
      </ScrollFade>,
    );
    const row = screen.getByRole('tablist');
    expect(screen.getByRole('button', { name: 'Alpha' })).toBeInTheDocument();
    expect(row).toHaveClass('scrollbar-none', 'overflow-x-auto', 'flex', 'gap-2');
    expect(row).toHaveAttribute('aria-label', 'props');
  });

  it('hides both fades when content fits (no overflow)', () => {
    render(<ScrollFade role="tablist"><button>a</button></ScrollFade>);
    setMetrics(screen.getByRole('tablist'), { scrollLeft: 0, clientWidth: 300, scrollWidth: 300 });
    const [left, right] = overlays();
    expect(left).toHaveClass('opacity-0');
    expect(right).toHaveClass('opacity-0');
  });

  it('shows only the right fade at the start of an overflowing row', () => {
    render(<ScrollFade role="tablist"><button>a</button></ScrollFade>);
    setMetrics(screen.getByRole('tablist'), { scrollLeft: 0, clientWidth: 100, scrollWidth: 300 });
    const [left, right] = overlays();
    expect(left).toHaveClass('opacity-0');
    expect(right).toHaveClass('opacity-100');
  });

  it('shows only the left fade at the end of an overflowing row', () => {
    render(<ScrollFade role="tablist"><button>a</button></ScrollFade>);
    setMetrics(screen.getByRole('tablist'), { scrollLeft: 200, clientWidth: 100, scrollWidth: 300 });
    const [left, right] = overlays();
    expect(left).toHaveClass('opacity-100');
    expect(right).toHaveClass('opacity-0');
  });

  it('vertical: scrolls on the y-axis and shows the bottom fade at the start', () => {
    render(<ScrollFade orientation="vertical" role="list"><button>a</button></ScrollFade>);
    const el = screen.getByRole('list');
    expect(el).toHaveClass('overflow-y-auto');
    setVerticalMetrics(el, { scrollTop: 0, clientHeight: 100, scrollHeight: 300 });
    const [top, bottom] = overlays();
    expect(top).toHaveClass('opacity-0');
    expect(bottom).toHaveClass('opacity-100');
  });
});
