import { DataSource } from 'typeorm';

export const truncateTables = async (dataSource: DataSource) => {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.clear();
    }
};

export const isJwt = (token: string | null): boolean => {
    if (!token) {
        return false;
    }

    if (token.split('.').length !== 3) {
        return false;
    }

    try {
        token.split('.').forEach((part) => {
            const buffer = Buffer.from(part, 'base64').toString('utf8');
            if (!buffer) {
                return false;
            }
        });
        return true;
    } catch (error: unknown) {
        return false;
    }
};
