import Image from 'next/image';

export default function Topbar() {
  return (
    <header className="flex items-center gap-3 px-6 py-3">
      <Image
        src="/brand/studymate-logo.svg"
        alt="StudyMate"
        width={50}
        height={50}
        priority
      />
      <span className="font-semibold tracking-wide text-2xl">StudyMate</span>
    </header>
  );
}