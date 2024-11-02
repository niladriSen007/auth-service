import { DataSource } from 'typeorm';

export const truncateTables = async (dataSource: DataSource) => {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.clear();
    }
};
