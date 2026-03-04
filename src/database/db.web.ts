export const initDatabase = async () => {
    console.log('Web environment: Database initialization skipped (Mock Mode)');
};

const mockDB = {
    runAsync: async () => ({ changes: 0, lastInsertRowId: 0 }),
    getAllAsync: async () => [],
    getFirstAsync: async () => null,
    execAsync: async () => { },
    eachAsync: async () => { },
    withTransactionAsync: async (callback: () => Promise<void>) => {
        await callback();
    },
};

export const getDB = async () => {
    console.log('Web environment: Returning mock database');
    return mockDB;
};
