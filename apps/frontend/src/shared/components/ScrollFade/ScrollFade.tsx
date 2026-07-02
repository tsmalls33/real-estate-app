import { useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react';

// `className` and any standard div attributes (role, aria-*, ...) are forwarded
// to the inner scroll container so callers keep control of layout and semantics.
type Props = HTMLAttributes<HTMLDivElement> & {
  // Colour the gradients fade from; defaults to the themed brand secondary so
  // the edge reads as a visible scroll cue. Pass e.g. 'var(--bg)' / 'var(--surface)'
  // for a plain blend-into-background fade instead.
  fadeColor?: string;
  // Scroll axis. Vertical fills its parent's height and scrolls top/bottom.
  orientation?: 'horizontal' | 'vertical';
};

// Wraps a scrollable container and overlays edge gradients that fade in when
// there is more content in that direction. The native scrollbar is hidden
// (scrollbar-none); these fades are the affordance instead.
export default function ScrollFade({
  children,
  className,
  fadeColor = 'var(--brand-secondary)',
  orientation = 'horizontal',
  ...rest
}: Props) {
  const vertical = orientation === 'vertical';
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (vertical) {
      setAtStart(el.scrollTop <= 0);
      setAtEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
    } else {
      setAtStart(el.scrollLeft <= 0);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    }
  }, [vertical]);

  // Recompute after every render so content changes (e.g. async-loaded items)
  // are picked up, and on viewport resize.
  useEffect(update);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const fade = (to: string) =>
    `linear-gradient(to ${to}, color-mix(in srgb, ${fadeColor} 35%, transparent), transparent)`;

  return (
    <div className={`relative ${vertical ? 'h-full' : ''}`}>
      <div
        {...rest}
        ref={ref}
        onScroll={update}
        className={`${vertical ? 'h-full overflow-y-auto' : 'overflow-x-auto'} scrollbar-none ${className ?? ''}`}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={`pointer-events-none absolute transition-opacity duration-150 ${atStart ? 'opacity-0' : 'opacity-100'} ${vertical ? 'inset-x-0 top-0 h-[10px]' : 'inset-y-0 left-0 w-[10px]'}`}
        style={{ background: fade(vertical ? 'bottom' : 'right') }}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute transition-opacity duration-150 ${atEnd ? 'opacity-0' : 'opacity-100'} ${vertical ? 'inset-x-0 bottom-0 h-[10px]' : 'inset-y-0 right-0 w-[10px]'}`}
        style={{ background: fade(vertical ? 'top' : 'left') }}
      />
    </div>
  );
}
