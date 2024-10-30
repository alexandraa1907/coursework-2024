const request = require('supertest');
const app = require('../app');

const agent = request.agent(app);

test('Unauthorized', async () => {
    const response = await agent.get('/');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
});

test('Wrong password', async () => {
    const response = await agent.get('/').set('cookie', [
        'login=kateryna_admin;',
        'password=1111;'
    ]);
    expect(response.status).toBe(302);
});

test('Correct login and password', async () => {
    const agent = request.agent(app);
    const response = await agent.get('/').set('cookie', [
        'login=kateryna_admin;',
        'password=1234;'
    ]);
    expect(response.status).toBe(200);
});

test('Uncorrect data', async () => {
    const agent = request.agent(app);
    const response = await agent.post('/create-consul').set('cookie', [
        'login=kateryna_admin;',
        'password=1234;'
    ]);
    expect(response.status).toBe(302);
});