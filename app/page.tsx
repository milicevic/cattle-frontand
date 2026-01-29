import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 font-sans dark:bg-green-950">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-green-900/30 sm:items-start">
        <Image
          className="dark:invert opacity-80"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-green-800 dark:text-green-100">
            Welcome to Cattle Management
          </h1>
          <p className="max-w-md text-lg leading-8 text-green-700 dark:text-green-300">
            Manage your cattle inventory and track your livestock with ease. Get started by creating an account or logging in.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Button asChild className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600">
            <Link href="/login">
              Login
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full md:w-auto border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50">
            <Link href="/register">
              Register
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
