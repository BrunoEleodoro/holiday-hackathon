'use client';

import 'viem/window';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { chains } from '@lens-network/sdk/viem';
import { CreateAccountWithUsernameResult, PublicClient, ResultAsync, UnauthenticatedError, UnexpectedError, testnet as protocolTestnet } from '@lens-protocol/client';
import { createAccountWithUsername, fetchAccount } from '@lens-protocol/client/actions';
import { handleWith } from '@lens-protocol/client/viem';
import { account } from '@lens-protocol/metadata';
import { StorageClient, testnet as storageTestnet } from '@lens-protocol/storage-node-client';
import { type Address, createWalletClient, custom } from 'viem';

const chain = chains.testnet;

type LensContextType = {
    client: PublicClient;
    createAccount: (name: string, username: string) => ResultAsync<CreateAccountWithUsernameResult, UnexpectedError | UnauthenticatedError>;
    isAuthenticated: boolean;
};

const LensContext = createContext<LensContextType>({
    client: PublicClient.create({ environment: protocolTestnet }),
    createAccount: () => ResultAsync.ok({ username: { value: '' }, address: '' }),
    isAuthenticated: false
});

export function LensProvider({ children }: { children: ReactNode }) {
    const [client, setClient] = useState<PublicClient>(PublicClient.create({ environment: protocolTestnet }));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sessionClient, setSessionClient] = useState<any>(null);

    useEffect(() => {
        const initializeClient = async () => {
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
                        onboardingUser: {
                            wallet: walletClient.account.address,
                            app: '0xe5439696f4057aF073c0FB2dc6e5e755392922e1',
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

            } catch (error) {
                console.error('Failed to initialize Lens client:', error);
                setIsAuthenticated(false);
            }
        };

        initializeClient();
    }, []);

    const createAccount = async (name: string, username: string): Promise<CreateAccountWithUsernameResult> => {
        const storageClient = StorageClient.create(storageTestnet);

        const metadata = account({
            name: name,
        });

        const { uri } = await storageClient.uploadFile(
            new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' })
        );

        const walletClient = createWalletClient({
            account: await sessionClient.wallet.address,
            chain,
            transport: custom(window.ethereum!),
        });

        const created = await createAccountWithUsername(sessionClient, {
            metadataUri: uri,
            username: {
                localName: `${username}.${Date.now()}`,
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

        return created as unknown as CreateAccountWithUsernameResult;
    };

    return (
        <LensContext.Provider value={{ client, createAccount, isAuthenticated }}>
            {children}
        </LensContext.Provider>
    );
}

export function useLens() {
    return useContext(LensContext);
}
