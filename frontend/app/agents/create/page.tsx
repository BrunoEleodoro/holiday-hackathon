'use client';

import { ConnectKitButton } from 'connectkit';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { storageClient } from "../../../services/storage-client";
import { account } from '@lens-protocol/metadata';

export default function CreateAgentPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: 'AI-Assistant',
        bio: 'I am a helpful AI assistant that can engage in natural conversations and help with various tasks.',
        picture: 'https://placekitten.com/200/200',
        coverPicture: 'https://placekitten.com/800/200',
        twitter: '@ai_assistant',
        dob: '2023-01-01',
        enabled: true,
        height: '180cm',
        settings: 'default'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log(formData);

        const metadata = account({
            ...formData
        });
        const { uri } = await storageClient.uploadFile(new File([JSON.stringify(metadata)], 'metadata.json'), {});

        console.log(uri);
    };

    return (
        <main className="p-8 min-h-screen font-sans text-white bg-gray-900">
            <form onSubmit={handleSubmit} className="mx-auto space-y-6 max-w-2xl">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block mb-1 text-sm font-medium">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="px-3 py-2 w-full text-white bg-gray-800 rounded-md"
                        />
                    </div>

                    <div>
                        <label htmlFor="bio" className="block mb-1 text-sm font-medium">Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="px-3 py-2 w-full text-white bg-gray-800 rounded-md"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label htmlFor="picture" className="block mb-1 text-sm font-medium">Profile Picture URL</label>
                        <input
                            type="text"
                            id="picture"
                            name="picture"
                            value={formData.picture}
                            onChange={handleChange}
                            className="px-3 py-2 w-full text-white bg-gray-800 rounded-md"
                        />
                    </div>

                    <div>
                        <label htmlFor="coverPicture" className="block mb-1 text-sm font-medium">Cover Picture URL</label>
                        <input
                            type="text"
                            id="coverPicture"
                            name="coverPicture"
                            value={formData.coverPicture}
                            onChange={handleChange}
                            className="px-3 py-2 w-full text-white bg-gray-800 rounded-md"
                        />
                    </div>

                    <div>
                        <label htmlFor="twitter" className="block mb-1 text-sm font-medium">Twitter URL</label>
                        <input
                            type="url"
                            id="twitter"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleChange}
                            className="px-3 py-2 w-full text-white bg-gray-800 rounded-md"
                        />
                    </div>

                    <div>
                        <label htmlFor="dob" className="block mb-1 text-sm font-medium">Date of Birth</label>
                        <input
                            type="datetime-local"
                            id="dob"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="px-3 py-2 w-full text-white bg-gray-800 rounded-md"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="enabled"
                            name="enabled"
                            checked={formData.enabled}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <label htmlFor="enabled" className="text-sm font-medium">Enabled</label>
                    </div>

                    <div>
                        <label htmlFor="height" className="block mb-1 text-sm font-medium">Height</label>
                        <input
                            type="number"
                            id="height"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            step="0.01"
                            className="px-3 py-2 w-full text-white bg-gray-800 rounded-md"
                        />
                    </div>

                    <div>
                        <label htmlFor="settings" className="block mb-1 text-sm font-medium">Settings (JSON)</label>
                        <input
                            type="text"
                            id="settings"
                            name="settings"
                            value={formData.settings}
                            onChange={handleChange}
                            placeholder='{"theme": "dark"}'
                            className="px-3 py-2 w-full text-white bg-gray-800 rounded-md"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="px-4 py-2 w-full font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                    Create Profile
                </button>
            </form>
        </main>
    );
}
