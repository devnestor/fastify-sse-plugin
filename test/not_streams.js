/* eslint-disable no-confusing-arrow */

"use strict";

const fastifySse = require("../index");

const fastifyModule = require("fastify");
const test = require("tap").test;
const request = require("request");

test("reply.sse could send strings", (t) => {
  t.plan(7);

  const fastify = fastifyModule();
  fastify.register(fastifySse, (err) => {
    t.error(err);
  });

  const data = "hello: world";

  fastify.get("/", (request, reply) => {
    reply.sse(data);
    reply.sse();
  });

  fastify.listen(0, (err) => {
    t.error(err);

    request({
      method: "GET",
      uri: `http://localhost:${fastify.server.address().port}`
    }, (err, response, body) => {
      t.error(err);
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.headers["content-type"], "text/event-stream");
      t.strictEqual(response.headers["content-encoding"], "identity");
      t.equal(body, `id: 1\r\ndata: ${data}\r\n\r\nevent: end\r\ndata: \r\n\r\n`);
      t.end();
      fastify.close();
    });
  });
});

test("reply.sse could send objects", (t) => {
  t.plan(7);

  const fastify = fastifyModule();
  fastify.register(fastifySse, (err) => {
    t.error(err);
  });

  const data = {hello: "world"};

  fastify.get("/", (request, reply) => {
    reply.sse(data);
    reply.sse();
  });

  fastify.listen(0, (err) => {
    t.error(err);

    request({
      method: "GET",
      uri: `http://localhost:${fastify.server.address().port}`
    }, (err, response, body) => {
      t.error(err);
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.headers["content-type"], "text/event-stream");
      t.strictEqual(response.headers["content-encoding"], "identity");
      t.equal(body, `id: 1\r\ndata: ${JSON.stringify(data)}\r\n\r\nevent: end\r\ndata: \r\n\r\n`);
      t.end();
      fastify.close();
    });
  });
});

test("reply.sse could send event name \"hello\"", (t) => {
  t.plan(7);

  const fastify = fastifyModule();
  fastify.register(fastifySse, (err) => {
    t.error(err);
  });

  const data = {hello: "world"};

  fastify.get("/", (request, reply) => {
    reply.sse(data, {event: "hello"});
    reply.sse();
  });

  fastify.listen(0, (err) => {
    t.error(err);

    request({
      method: "GET",
      uri: `http://localhost:${fastify.server.address().port}`
    }, (err, response, body) => {
      t.error(err);
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.headers["content-type"], "text/event-stream");
      t.strictEqual(response.headers["content-encoding"], "identity");
      t.equal(body, `id: 1\r\nevent: hello\r\ndata: ${JSON.stringify(data)}\r\n\r\nevent: end\r\ndata: \r\n\r\n`);
      t.end();
      fastify.close();
    });
  });
});

test("reply.sse could send event name generated by function", (t) => {
  t.plan(7);

  const fastify = fastifyModule();
  fastify.register(fastifySse, (err) => {
    t.error(err);
  });

  const data = {hello: "world"};

  fastify.get("/", (request, reply) => {
    reply.sse(data, {event: (event) => event ? event.hello : undefined});
    reply.sse();
  });

  fastify.listen(0, (err) => {
    t.error(err);

    request({
      method: "GET",
      uri: `http://localhost:${fastify.server.address().port}`
    }, (err, response, body) => {
      t.error(err);
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.headers["content-type"], "text/event-stream");
      t.strictEqual(response.headers["content-encoding"], "identity");
      t.equal(body, `id: 1\r\nevent: world\r\ndata: ${JSON.stringify(data)}\r\n\r\nevent: end\r\ndata: \r\n\r\n`);
      t.end();
      fastify.close();
    });
  });
});

test("reply.sse could generate id by function", (t) => {
  t.plan(7);

  const fastify = fastifyModule();
  fastify.register(fastifySse, (err) => {
    t.error(err);
  });

  const data = {hello: "world", num: 4};

  fastify.get("/", (request, reply) => {
    reply.sse(data, {idGenerator: (event) => event ? event.num * 5 : undefined});
    reply.sse();
  });

  fastify.listen(0, (err) => {
    t.error(err);

    request({
      method: "GET",
      uri: `http://localhost:${fastify.server.address().port}`
    }, (err, response, body) => {
      t.error(err);
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.headers["content-type"], "text/event-stream");
      t.strictEqual(response.headers["content-encoding"], "identity");
      t.equal(body, `id: ${4 * 5}\r\ndata: ${JSON.stringify(data)}\r\n\r\nevent: end\r\ndata: \r\n\r\n`);
      t.end();
      fastify.close();
    });
  });
});

test("reply.sse does not want id", (t) => {
  t.plan(7);

  const fastify = fastifyModule();
  fastify.register(fastifySse, (err) => {
    t.error(err);
  });

  const data = {hello: "world"};

  fastify.get("/", (request, reply) => {
    reply.sse(data, {idGenerator: null});
    reply.sse();
  });

  fastify.listen(0, (err) => {
    t.error(err);

    request({
      method: "GET",
      uri: `http://localhost:${fastify.server.address().port}`
    }, (err, response, body) => {
      t.error(err);
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.headers["content-type"], "text/event-stream");
      t.strictEqual(response.headers["content-encoding"], "identity");
      t.equal(body, `data: ${JSON.stringify(data)}\r\n\r\nevent: end\r\ndata: \r\n\r\n`);
      t.end();
      fastify.close();
    });
  });
});

test("reply.sse throw an error if idGenerator is not valid", (t) => {
  t.plan(4);

  const fastify = fastifyModule();
  fastify.register(fastifySse, (err) => {
    t.error(err);
  });

  const data = {hello: "world"};

  fastify.get("/", (request, reply) => {
    t.throws(() => reply.sse(data, {idGenerator: true}), new Error("Option idGenerator must be a function or null"));
    reply.send();
  });

  fastify.listen(0, (err) => {
    t.error(err);

    request({
      method: "GET",
      uri: `http://localhost:${fastify.server.address().port}`
    }, (err) => {
      t.error(err);
      t.end();
      fastify.close();
    });
  });
});