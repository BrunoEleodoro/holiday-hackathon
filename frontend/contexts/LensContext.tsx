'use client';

import 'viem/window';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { chains } from '@lens-network/sdk/viem';
import { CreateAccountWithUsernameResult, PublicClient, ResultAsync, UnauthenticatedError, UnexpectedError, testnet as protocolTestnet, evmAddress } from '@lens-protocol/client';
import { createAccountWithUsername, fetchAccount, createApp as createLensApp, fetchApp, fetchAccountsAvailable, createGroup, setAccountMetadata } from '@lens-protocol/client/actions';
import { handleWith } from '@lens-protocol/client/viem';
import { account, app, MetadataAttributeType, metadataDetailsWith, Platform } from '@lens-protocol/metadata';
import { StorageClient, testnet as storageTestnet } from '@lens-protocol/storage-node-client';
import { type Address, createWalletClient, custom } from 'viem';
import { storageClient } from '../services/storage-client';
import { AccountsResponse } from '../app/types/accounts';

const chain = chains.testnet;


export function LensProvider({ children }: { children: ReactNode }) {
    const [client, setClient] = useState<PublicClient>(PublicClient.create({ environment: protocolTestnet }));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sessionClient, setSessionClient] = useState<any>(null);
    const [accounts, setAccounts] = useState<AccountsResponse>({ items: [], pageInfo: { __typename: 'PaginatedResultInfo', prev: null, next: null } });

    const fetchUserAccounts = async () => {
        if (!client) {
            throw new Error('Client not initialized');
        }

        try {
            const [address] = (await window.ethereum!.request({
                method: 'eth_requestAccounts'
            })) as [Address];

            const result = await fetchAccountsAvailable(client, {
                managedBy: evmAddress("0xDd6d37E29294A985E49fF301Acc80877fC24997F"),
            });
            if (result.isErr()) {
                console.error('Failed to fetch account:', result.error);
            } else {
                console.log('Fetched accounts:', result.value);
                const accounts = result.value as unknown as AccountsResponse
                // const filteredAccounts = {
                //     items: await Promise.all(accounts.items.map((account) => fetchAccount(client, { address: account.account.address }))),
                //     pageInfo: accounts.pageInfo
                // };
                // console.log('Filtered accounts:', filteredAccounts);
                setAccounts(accounts);
            }
        } catch (error) {
            console.error('Failed to fetch user accounts:', error);
        }
    };

    const connect = async () => {
        try {
            const [address] = (await window.ethereum!.request({
                method: 'eth_requestAccounts'
            })) as [Address];

            const walletClient = createWalletClient({
                account: address,
                chain,
                transport: custom(window.ethereum!),
            });

            const newClient = PublicClient.create({
                environment: protocolTestnet,
            });

            const newSessionClient = await newClient
                .login({
                    // builder: {
                    //     address: walletClient.account.address,
                    // },
                    // accountOwner: {
                    //     account: evmAddress(walletClient.account.address),
                    //     owner: evmAddress(walletClient.account.address),
                    //     app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1"
                    // },
                    onboardingUser: {
                        wallet: walletClient.account.address,
                    },
                    signMessage: async (message) => walletClient.signMessage({ message }),
                })
                .match(
                    (result) => result,
                    (error) => {
                        throw error;
                    },
                );

            setClient(newClient);
            setSessionClient(newSessionClient);
            setIsAuthenticated(true);

            // Fetch accounts after successful authentication
            await fetchUserAccounts();

        } catch (error) {
            console.error('Failed to initialize Lens client:', error);
            setIsAuthenticated(false);
        }
    };

    const createAccount = async ({ name, username, bio, picture, character, }: { name: string, username: string, bio: string, picture: string, character: string, }): Promise<CreateAccountWithUsernameResult> => {
        if (!sessionClient) {
            throw new Error('Not connected. Please connect first.');
        }

        const storageClient = StorageClient.create(storageTestnet);

        const pictureUri = await storageClient.uploadFile(new File([picture], 'picture.png', { type: 'image/png' }));

        const id = `${name}-ai-agent-arena.${new Date().getTime()}`;
        const metadata = account({
            name,
            id,
            bio,
            attributes: [
                {
                    key: 'character',
                    value: character,
                    type: MetadataAttributeType.STRING
                }
            ]
        });
        console.log(metadata);
        const { uri } = await storageClient.uploadFile(
            new File([JSON.stringify(metadata)], `metadata-${id}.json`, { type: 'application/json' })
        );
        console.log(uri);
        const [address] = (await window.ethereum!.request({
            method: 'eth_requestAccounts'
        })) as [Address];

        const walletClient = createWalletClient({
            account: address,
            chain,
            transport: custom(window.ethereum!),
        });

        const created = await createAccountWithUsername(sessionClient, {
            metadataUri: uri,
            accountManager: [evmAddress(walletClient.account.address)],
            username: {
                localName: `${username}`,
            },
        })
            .andThen(handleWith(walletClient as any))
            .andThen(sessionClient.waitForTransaction)
            .andThen((txHash) => fetchAccount(sessionClient, { txHash }))
            .match(
                (result) => result,
                (error) => {
                    throw error;
                },
            );

        setAccountMetadata(sessionClient, {
            metadataUri: uri,
        })
        return created as unknown as CreateAccountWithUsernameResult;
    };

    const createApp = async () => {
        if (!sessionClient) {
            throw new Error('Not connected. Please connect first.');
        }

        const [address] = (await window.ethereum!.request({
            method: 'eth_requestAccounts'
        })) as [Address];

        const walletClient = createWalletClient({
            account: address,
            chain,
            transport: custom(window.ethereum!),
        });

        const newClient = PublicClient.create({
            environment: protocolTestnet,
        });

        const newSessionClient = await newClient
            .login({
                builder: {
                    address: walletClient.account.address,
                },
                signMessage: async (message) => walletClient.signMessage({ message }),

            })
            .match(
                (result) => result,
                (error) => {
                    throw error;
                },
            );
        const metadata = app({
            name: "On-Chain AI RPG",
            tagline: "The Next Evolution of Gaming",
            description: "Create AI-driven agents with unique attributes, all on the Lens Network. Battle, explore, and trade in a decentralized world. Each agent is unique, powered by on-chain wallets, and shaped by user-provided attributes and personalities.",
            logo: "lens://4f91cab87ab5e4f5066f878b72…",
            developer: "On-Chain AI RPG Team <contact@agent-arena.xyz>",
            url: "https://agent-arena.xyz",
            termsOfService: "https://agent-arena.xyz/terms",
            privacyPolicy: "https://agent-arena.xyz/privacy",
            platforms: [Platform.WEB],
        });

        const { uri } = await storageClient.uploadFile(
            new File([JSON.stringify(metadata)], 'metadata-app.json', {
                type: "application/json",
            })
        );

        const result = await createLensApp(newSessionClient, {
            metadataUri: uri,
        })
            .andThen(handleWith(walletClient as any))
            .andThen(sessionClient.waitForTransaction)
            .andThen((txHash) => fetchApp(sessionClient, { txHash }));

        if (result.isErr()) {
            return console.error(result.error);
        }

        const createdApp = result.value;
        console.log('Created app:', createdApp);
    };

    return (
        <LensContext.Provider value={{ client, createAccount, createApp, isAuthenticated, connect, accounts, fetchUserAccounts }}>
            {children}
        </LensContext.Provider>
    );
}


type LensContextType = {
    client: PublicClient;
    createAccount: (name: string, username: string, bio: string, picture: string, character: string) => Promise<CreateAccountWithUsernameResult>;
    isAuthenticated: boolean;
    createApp: () => Promise<void>;
    connect: () => Promise<void>;
    accounts: AccountsResponse;
    fetchUserAccounts: () => Promise<void>;
};

const LensContext = createContext<LensContextType>({
    client: PublicClient.create({ environment: protocolTestnet }),
    createAccount: () => Promise.resolve({ username: { value: '' }, address: '' }),
    isAuthenticated: false,
    createApp: () => Promise.resolve(),
    connect: () => Promise.resolve(),
    accounts: { items: [], pageInfo: { __typename: 'PaginatedResultInfo', prev: null, next: null } },
    fetchUserAccounts: () => Promise.resolve()
});

export function useLens() {
    return useContext(LensContext);
}
