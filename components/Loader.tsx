// components/Loader.tsx
'use client';

type Props = { size?: number; label?: string };

export default function Loader({ size = 88, label = 'Loading' }: Props) {
  const px = `${size}px`;
  return (
    <div
      className="loader-wrapper"
      style={
        {
          // make the Uiverse loader scalable per page
          '--loader-size': px,
          '--loader-font': `${Math.max(12, Math.floor(size / 7))}px`,
        } as React.CSSProperties
      }
      aria-label={label}
      role="status"
    >
      <div className="loader" />
      {label.split('').map((ch, i) => (
        <span className="loader-letter" key={i}>
          {ch}
        </span>
      ))}
    </div>
  );
}
