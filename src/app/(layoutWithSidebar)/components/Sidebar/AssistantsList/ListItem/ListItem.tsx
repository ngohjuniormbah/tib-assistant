import Link from 'next/link';

type Props = {
  title: string;
  href: string;
  isActive?: boolean;
  isDisabled?: boolean;
};

export default function ListItem({
  title,
  href,
  isActive = false,
  isDisabled = false,
}: Props) {
  return (
    <li className="ms-6 relative">
      <span
        className={`absolute flex items-center justify-center w-4 h-4 ${
          isDisabled ? 'bg-surface-tertiary' : 'bg-default'
        } rounded-full left-[-33px] top-1 ring-4 ring-surface`}
      />
      {!isDisabled ? (
        <Link
          href={href}
          className={`text-inherit ${isActive ? 'font-bold' : ''}`}
        >
          {title}
        </Link>
      ) : (
        <span className="opacity-30">{title}</span>
      )}
    </li>
  );
}
