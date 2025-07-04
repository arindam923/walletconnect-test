import Moralis from 'moralis';

const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY || 'YOUR_MORALIS_API_KEY';

let isInitialized = false;

export const initializeMoralis = async () => {
  if (!isInitialized) {
    try {
      await Moralis.start({
        apiKey: MORALIS_API_KEY,
      });
      isInitialized = true;
      console.log('Moralis initialized successfully');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Modules are started already')) {
        console.log('Moralis was already initialized');
        isInitialized = true;
      } else {
        console.error('Error initializing Moralis:', error);
        throw error;
      }
    }
  }
};
