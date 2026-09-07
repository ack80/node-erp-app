// src/infrastructure/http/test/request-body.test.js

import {describe, it, expect } from 'vitest';
import {Readable} from 'node:stream';
import {parseJsonBody} from '../request-body.js';

//
describe('parseJsonBody (HTTP Stream Parser)', () => {
    it('Debe retornar objeto vacio si el metodo es GET', async () => {
        const fakeReq = Readable.from([]);
        fakeReq.method = 'GET';
        const result = await parseJsonBody(fakeReq);
        expect(result).toEqual({});
    });

    //
    it('Debe parsear correctamente un JSON recibido en chunks', async () => {
        const payload = {username:'Adonay', rol:'admin'};
        const jsonSting = JSON.stringify(payload);
        // Se simula la llegada frAgmentada por la red en dos paquetes TCP
        const chunk1 = jsonSting.slice(0, 10);
        const chiunk2 = jsonSting.slice(10);
        const fakeReq = Readable.from([chunk1, chiunk2]);
        fakeReq.method = 'POST';
        const result = await parseJsonBody(fakeReq);
        expect(result).toEqual(payload);
    });

    //
    it('Debe retornar objeto vacio si el body viene vacio', async () => {
        const fakeReq = Readable.from([' ']);
        fakeReq.method = 'POST';
        const result = await parseJsonBody(fakeReq);
        expect(result).toEqual({});
    });

    //
    it('Debe lanzar error con statusCode 400 si el JSON esta mal formado.', async () => {
        const fakeReq = Readable.from(['{"malformado": ']);
        fakeReq.method = 'POST';
        await expect(parseJsonBody(fakeReq)).rejects.toMatchObject({
            message: expect.stringContaining('Invalid JSON'),
            statusCode: 400,
        });
    });

    //
    it('Debe rechazar con 413 si el body supera el limite de  1MB.', async () => {
        // Se genera un chunck que supere 1MB.
        const bigChunck = Buffer.alloc(1024 * 1024 +10);
        const fakeReq = Readable.from([bigChunck]);
        fakeReq.method = 'POST';
        await expect(parseJsonBody(fakeReq)).rejects.toMatchObject({
            message: expect.stringContaining('Payload Too large'),
            statusCode: 413,
        })
    });
});