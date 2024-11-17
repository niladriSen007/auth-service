import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { App } from 'supertest/types';
import { Tenant } from '../../src/entity/Tenant';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/entity/enum/Roles';

describe('Tenants tests', () => {
    let dataSource: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        dataSource = await AppDataSource.initialize();
        jwks = createJWKSMock('http://localhost:9001');
    });

    beforeEach(async () => {
        await dataSource.dropDatabase();
        await dataSource.synchronize();
        jwks.start();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('should create a tenant', async () => {
        const tenantData = {
            name: 'Tenant 1',
            address: 'Address 1',
        };

        const adminToken = jwks.token({
            sub: '1',
            roles: [Roles.ADMIN],
        });

        console.log(adminToken, 'adminToken');

        const response = await request(app as App)
            .post('/tenants')
            .set('Cookie', [`accessToken=${adminToken}`])
            .send(tenantData);

        expect(response.statusCode).toBe(201);
    });

    it('should store the tenat in the database', async () => {
        const tenantData = {
            name: 'Tenant 1',
            address: 'Address 1',
        };

        const adminToken = jwks.token({
            sub: '1',
            roles: [Roles.ADMIN],
        });

        await request(app as App)
            .post('/tenants')
            .set('Cookie', [`accessToken=${adminToken}`])
            .send(tenantData);

        const tenants = await dataSource.getRepository(Tenant).find();

        expect(tenants).toBeDefined();
        expect(tenants).toHaveLength(1);
        expect(tenants[0]?.name).toBe(tenantData.name);
        expect(tenants[0]?.address).toBe(tenantData.address);
    });

    it('should return 401 if the user is not authenticated', async () => {
        const tenantData = {
            name: 'Tenant 1',
            address: 'Address 1',
        };

        const response = await request(app as App)
            .post('/tenants')
            .send(tenantData);

        expect(response.statusCode).toBe(401);

        const tenants = await dataSource.getRepository(Tenant).find();
        expect(tenants).toHaveLength(0);
    });

    it('should return 403 if the user is not an admin', async () => {
        const tenantData = {
            name: 'Tenant 1',
            address: 'Address 1',
        };

        const userToken = jwks.token({
            sub: '1',
            roles: [Roles.CUSTOMER],
        });

        const response = await request(app as App)
            .post('/tenants')
            .set('Cookie', [`accessToken=${userToken}`])
            .send(tenantData);

        expect(response.statusCode).toBe(403);

        const tenants = await dataSource.getRepository(Tenant).find();
        expect(tenants).toHaveLength(0);
    });
});
