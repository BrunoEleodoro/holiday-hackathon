'use client';

import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';
import { useRouter, } from 'next/navigation';
import { MetadataAttributeType, Platform, app } from "@lens-protocol/metadata";
import { storageClient } from "../services/storage-client";

export default function Navbar() {
  const router = useRouter();

  async function createApp() {
    const metadata = app({
      name: "AI Agent Arena",
      tagline: "The next big thing",
      description: "An app to rule them all",
      logo: "lens://4f91cab87ab5e4f5066f878b72…",
      developer: "John Doe <john.doe@email.com>",
      url: "https://example.com",
      termsOfService: "https://example.com/terms",
      privacyPolicy: "https://example.com/privacy",
      platforms: [Platform.WEB],
    });
    const { uri } = await storageClient.uploadFile(new File([JSON.stringify(metadata)], 'metadata.json', {
      type: "application/json",
    }));

    console.log(uri); // e.g., lens://4f91ca…

  }

  return (
    <header className="py-6 w-full bg-gray-800">
      <div className="flex justify-between items-center px-4 mx-auto max-w-6xl">
        <h1 onClick={() => router.push('/')} className="text-2xl font-bold text-white cursor-pointer">On-Chain AI RPG</h1>
        <nav>
          <ul className="flex items-center space-x-4">
            <li>
              <Link href="/agents/create" className="text-white hover:text-indigo-400" onClick={createApp}>
                Create
              </Link>
            </li>
            <li>
              <Link href="/agents" className="text-white hover:text-indigo-400">
                Agents
              </Link>
            </li>
            <li>
              <Link href="/game" className="text-white hover:text-indigo-400">
                Game
              </Link>
            </li>
            <li>
              <Link href="/manage" className="text-white hover:text-indigo-400">
                Manage
              </Link>
            </li>
            <li>
              <ConnectKitButton />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
