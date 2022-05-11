import { strict as assert } from 'assert';

const CODE = {
  GREEN: 'green',
  RED: 'red',
  INSTRUCTOR: 'instructor',
};

const database = {
  '30101010101': CODE.GREEN,
  '30101010102': CODE.RED,
  '30101010103': CODE.INSTRUCTOR,
  '1': CODE.GREEN,
  '2': CODE.RED,
  '3': CODE.INSTRUCTOR,
};

const testCodes = [
  '1',
  '2',
  '3',
];

const assertValidId = (id) => {
  assert.equal(typeof id, 'string', 'Expected ID to be a string');
  assert.match(id, /[0-9]{11}/, 'Expected ID to consist of 11 digits');
};

export async function onRequest(context) {
  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  if (!testCodes.includes(params.id)) {
    assertValidId(params.id);
  }

  return new Response(
    JSON.stringify({
      success: true,
      id: params.id,
      status: database[params.id]
    }, null, 2)
  );
}
