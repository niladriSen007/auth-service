import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { App } from 'supertest/types';
import { Tenant } from '../../src/entity/Tenant';

describe('Tenants tests', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await dataSource.dropDatabase();
        await dataSource.synchronize();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('should create a tenant', async () => {
        const tenantData = {
            name: 'Tenant 1',
            address: 'Address 1',
        };

        const response = await request(app as App)
            .post('/tenants')
            .send(tenantData);

        expect(response.statusCode).toBe(201);
    });

    it('should store the tenat in the database', async () => {
        const tenantData = {
            name: 'Tenant 1',
            address: 'Address 1',
        };

        const response = await request(app as App)
            .post('/tenants')
            .send(tenantData);

        const tenants = await dataSource.getRepository(Tenant).find();

        expect(tenants).toBeDefined();
        expect(tenants).toHaveLength(1);
        expect(tenants[0]?.name).toBe(tenantData.name);
        expect(tenants[0]?.address).toBe(tenantData.address);
    });
});
