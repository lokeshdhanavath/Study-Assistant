import Image from 'next/image';
import { LoginButton } from './loginButton';  // ✅ lowercase 'l' to match file name

export default function Topbar() {
  return (
    <header className="flex items-center justify-between gap-3 px-6 py-3">
      <div className="flex items-center gap-3">
        <Image
          src="/brand/studymate-logo.svg"
          alt="StudyMate"
          width={50}
          height={50}
          priority
        />
        <span className="font-semibold tracking-wide text-2xl">StudyMate</span>
      </div>
      
      <LoginButton />
    </header>
  );
}