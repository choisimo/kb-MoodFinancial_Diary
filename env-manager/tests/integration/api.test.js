/**
 * 서버 API 통합 테스트
 */

const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');
const app = require('../../server');

describe('API Integration Tests', () => {
    const testEnvPath = path.join(__dirname, '..', '..', 'test-temp', 'test.env');
    
    beforeEach(async () => {
        // 테스트용 .env 파일 생성
        await fs.ensureDir(path.dirname(testEnvPath));
        await fs.writeFile(testEnvPath, 'TEST_VAR=test_value\nANOTHER_VAR=another_value');
    });

    afterEach(async () => {
        // 테스트 파일 정리
        await fs.remove(path.dirname(testEnvPath));
    });

    describe('GET /api/env-files', () => {
        test('should return list of env files', async () => {
            const response = await request(app)
                .get('/api/env-files')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.files).toBeInstanceOf(Array);
        });
    });

    describe('POST /api/env-files', () => {
        test('should add new env file', async () => {
            const response = await request(app)
                .post('/api/env-files')
                .send({ filePath: testEnvPath })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.file).toHaveProperty('id');
            expect(response.body.file.name).toBe('test.env');
        });

        test('should return 400 for missing file path', async () => {
            const response = await request(app)
                .post('/api/env-files')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('required');
        });

        test('should return 404 for non-existent file', async () => {
            const response = await request(app)
                .post('/api/env-files')
                .send({ filePath: '/non/existent/file.env' })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('exist');
        });
    });

    describe('GET /api/env-files/:id', () => {
        let fileId;

        beforeEach(async () => {
            // 파일 추가
            const addResponse = await request(app)
                .post('/api/env-files')
                .send({ filePath: testEnvPath });
            
            fileId = addResponse.body.file.id;
        });

        test('should return env file content', async () => {
            const response = await request(app)
                .get(`/api/env-files/${fileId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.variables).toHaveProperty('TEST_VAR');
            expect(response.body.data.variables.TEST_VAR.value).toBe('test_value');
        });

        test('should return 404 for non-existent file id', async () => {
            const response = await request(app)
                .get('/api/env-files/non-existent-id')
                .expect(500);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/env-files/:id', () => {
        let fileId;

        beforeEach(async () => {
            const addResponse = await request(app)
                .post('/api/env-files')
                .send({ filePath: testEnvPath });
            
            fileId = addResponse.body.file.id;
        });

        test('should update env file variables', async () => {
            const newVariables = {
                'TEST_VAR': { value: 'updated_value' },
                'NEW_VAR': { value: 'new_value' }
            };

            const response = await request(app)
                .put(`/api/env-files/${fileId}`)
                .send({ variables: newVariables })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('successfully');
        });
    });

    describe('DELETE /api/env-files/:id', () => {
        let fileId;

        beforeEach(async () => {
            const addResponse = await request(app)
                .post('/api/env-files')
                .send({ filePath: testEnvPath });
            
            fileId = addResponse.body.file.id;
        });

        test('should remove env file from management', async () => {
            const response = await request(app)
                .delete(`/api/env-files/${fileId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('removed');
        });
    });

    describe('GET /api/env-files/:id/download', () => {
        let fileId;

        beforeEach(async () => {
            const addResponse = await request(app)
                .post('/api/env-files')
                .send({ filePath: testEnvPath });
            
            fileId = addResponse.body.file.id;
        });

        test('should download env file', async () => {
            const response = await request(app)
                .get(`/api/env-files/${fileId}/download`)
                .expect(200);

            expect(response.headers['content-disposition']).toContain('attachment');
            expect(response.headers['content-type']).toContain('text/plain');
            expect(response.text).toContain('TEST_VAR=test_value');
        });
    });

    describe('POST /api/env-files/:id/backup', () => {
        let fileId;

        beforeEach(async () => {
            const addResponse = await request(app)
                .post('/api/env-files')
                .send({ filePath: testEnvPath });
            
            fileId = addResponse.body.file.id;
        });

        test('should create backup of env file', async () => {
            const response = await request(app)
                .post(`/api/env-files/${fileId}/backup`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.backupPath).toContain('backup');
        });
    });

    describe('Error Handling', () => {
        test('should handle 404 for unknown routes', async () => {
            const response = await request(app)
                .get('/api/unknown-route')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.code).toBe('NOT_FOUND');
        });

        test('should handle malformed JSON', async () => {
            const response = await request(app)
                .post('/api/env-files')
                .send('invalid json')
                .set('Content-Type', 'application/json')
                .expect(400);
        });
    });
});