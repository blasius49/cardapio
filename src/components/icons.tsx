import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PizzaIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.2c4.6 0 8.4 3.5 8.8 8l-7.2 8.3a2 2 0 0 1-3.2 0L3.2 11.2C3.6 6.7 7.4 3.2 12 3.2Z" />
      <circle cx="10" cy="9" r="1.1" />
      <circle cx="14.4" cy="8.4" r="1.1" />
      <circle cx="12" cy="13" r="1.1" />
    </Base>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 4h2.2l1.6 10.2a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6L20 7.4H6.1" />
      <circle cx="9.6" cy="19.6" r="1.4" />
      <circle cx="16.8" cy="19.6" r="1.4" />
    </Base>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.4V12l3 1.8" />
    </Base>
  );
}

export function ScooterIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="5.6" cy="17.4" r="2.6" />
      <circle cx="18.4" cy="17.4" r="2.6" />
      <path d="M8.2 17.4h7.6M15.8 17.4 14 6.8h-2.4M11.6 10.6H6.4l-1.6 4.4" />
      <path d="M17.2 6.8h2.4l1.2 4.6" />
    </Base>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3s4.8 3.6 4.8 8a4.8 4.8 0 0 1-9.6 0c0-1.4.6-2.7 1.4-3.7.3 1.2 1 2 1.9 2.2C11 7.6 12 5.3 12 3Z" />
      <path d="M9.6 20.6h4.8" />
    </Base>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.8 19.2c-1.6-5.6 1.6-11.2 8-12.8 2-.5 4-.4 5.6-.2.4 2.2.3 4.6-.6 6.8-2 5-6.8 7.6-13 6.2Z" />
      <path d="M8.4 15.6c2.4-2.4 5-4 8-4.8" />
    </Base>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6.2 3.6h3l1.4 3.6-2 1.4a11.4 11.4 0 0 0 5 5l1.4-2 3.6 1.4v3a2 2 0 0 1-2.2 2A15.6 15.6 0 0 1 4.2 5.8a2 2 0 0 1 2-2.2Z" />
    </Base>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 21s6.8-5.6 6.8-10.6A6.8 6.8 0 0 0 5.2 10.4C5.2 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.2" r="2.4" />
    </Base>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m4.8 12.6 4.6 4.6 9.8-10.4" />
    </Base>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 5.4v13.2M5.4 12h13.2" />
    </Base>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5.4 12h13.2" />
    </Base>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m15.6 15.6 4 4" />
    </Base>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m12 4 2.3 4.9 5.3.7-3.9 3.7 1 5.3-4.7-2.6-4.7 2.6 1-5.3-3.9-3.7 5.3-.7L12 4Z" />
    </Base>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m6.4 9.6 5.6 5.6 5.6-5.6" />
    </Base>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.8 12h14.4M13.6 6.4 19.2 12l-5.6 5.6" />
    </Base>
  );
}

export function PixIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m12 3.6 4.4 4.4H20v3.6l-3.6 4L12 20.4 7.6 15.6 4 11.6V8h3.6L12 3.6Z" />
      <path d="m9.6 11.8 2.4 2.4 2.4-2.4" />
    </Base>
  );
}

export function CardIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5.6" width="18" height="12.8" rx="2.4" />
      <path d="M3 10h18M6.6 14.6h3.2" />
    </Base>
  );
}

export function CashIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="2.8" y="6.4" width="18.4" height="11.2" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6.4 12h.8M16.8 12h.8" />
    </Base>
  );
}

export function ChefIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M7 20.4h10v-6.2a4.6 4.6 0 0 0 2.6-7.6 4 4 0 0 0-6.4-2.4A4 4 0 0 0 7 5.6a4.4 4.4 0 0 0 0 8.6v6.2Z" />
      <path d="M10.4 14.2v6.2M13.6 14.2v6.2" />
    </Base>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.8 6.8h14.4M9.6 6.8V4.6h4.8v2.2M6.8 6.8l.9 12a1.6 1.6 0 0 0 1.6 1.4h5.4a1.6 1.6 0 0 0 1.6-1.4l.9-12" />
    </Base>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.6 13.6 9 19 10.6 13.6 12.2 12 17.6 10.4 12.2 5 10.6 10.4 9 12 3.6Z" />
      <path d="M18.4 16.8 19 18.8 21 19.4 19 20 18.4 22 17.8 20 15.8 19.4 17.8 18.8Z" />
    </Base>
  );
}

export function StoreIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 9.6V20h16V9.6" />
      <path d="M3 9.6 5.2 4h13.6L21 9.6a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z" />
      <path d="M10 20v-5.2h4V20" />
    </Base>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7.6h10M18 7.6h2M4 16.4h4M12 16.4h8" />
      <circle cx="16" cy="7.6" r="2" />
      <circle cx="10" cy="16.4" r="2" />
    </Base>
  );
}

export function WhatsappIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20.2 11.8a8.2 8.2 0 0 1-12.1 7.2L3.8 20.2l1.3-4.2A8.2 8.2 0 1 1 20.2 11.8Z" />
      <path d="M9 9.2c.4 2.4 2 4.2 4.6 5 .7-.4 1-.9 1-1.5l-1.9-.9-.8.9c-1-.5-1.7-1.2-2.1-2.2l.9-.8-.8-1.9c-.5 0-.9.4-1 1.4Z" />
    </Base>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4.8" />
      <circle cx="12" cy="12" r="3.8" />
      <path d="M16.9 7.1h.01" />
    </Base>
  );
}

export function NoteIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 3.8h9.2L19 7.6V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.8a1 1 0 0 1 1-1Z" />
      <path d="M14.8 4v4h4M8.4 12.6h7.2M8.4 16.4h4.8" />
    </Base>
  );
}
