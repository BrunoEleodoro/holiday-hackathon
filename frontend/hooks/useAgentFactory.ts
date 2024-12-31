import abi from '../abis/AgentFactory.json'
import { useLens } from '../contexts/LensContext';

export const useAgentFactory = () => {
    const { client } = useLens();
    
    return client;
}