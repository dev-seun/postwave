"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-black dark:to-zinc-900 font-sans">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center py-24 px-6 sm:px-12">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* <Image
            className="dark:invert mb-2"
            src="/next.svg"
            alt="Backend Logo"
            width={90}
            height={24}
            priority
          /> */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black dark:text-zinc-50 mb-2">
            Welcome to Your Postwave Platform
          </h1>
          <p className="max-w-2xl text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 mb-6">
            Powerful API for app management, platform connections, and AI-powered post generation. Seamlessly connect, manage, and automate your social media presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <a
              href="#features"
              className="rounded-full bg-black text-white px-8 py-3 font-semibold shadow hover:bg-zinc-800 transition-colors"
            >
              Explore Features
            </a>
            <a
              href="/docs"
              className="rounded-full border border-black dark:border-zinc-200 px-8 py-3 font-semibold text-black dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              API Documentation
            </a>
          </div>
        </div>
        {/* Features Section */}
        <section id="features" className="w-full mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🔗</span>
            <h2 className="text-xl font-semibold mb-1">Connect Platforms</h2>
            <p className="text-zinc-600 dark:text-zinc-300 text-center">Easily link your apps to supported platforms and manage connections securely.</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🤖</span>
            <h2 className="text-xl font-semibold mb-1">AI Post Generation</h2>
            <p className="text-zinc-600 dark:text-zinc-300 text-center">Generate engaging posts for your connected platforms using advanced AI models.</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">📊</span>
            <h2 className="text-xl font-semibold mb-1">App & User Management</h2>
            <p className="text-zinc-600 dark:text-zinc-300 text-center">Manage your apps, users, and content with a robust, secure API.</p>
          </div>
        </section>
        {/* Call to Action */}
        <div className="mt-16 flex flex-col items-center">
          <h3 className="text-2xl font-semibold mb-2 text-black dark:text-zinc-50">Ready to get started?</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Show when="signed-out">
              <SignInButton forceRedirectUrl="/dashboard">
                <button className="bg-blue-600 text-white rounded-full font-semibold px-8 py-3 shadow hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton signInForceRedirectUrl="/dashboard">
                <button className="bg-purple-700 text-white rounded-full font-semibold px-8 py-3 shadow hover:bg-purple-800 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
              <a
                href="/dashboard"
                className="rounded-full bg-blue-600 text-white px-8 py-3 font-semibold shadow hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </a>
            </Show>
          </div>
        </div>
      </main>
    </div>
  );
}
