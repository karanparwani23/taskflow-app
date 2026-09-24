import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { CredentialsDto } from './dto/auth.dto';
import { UserDocument } from './user.schema';

describe('AuthService', () => {
  const state: {
    createCalls: Record<string, unknown>[];
    findCalls: Record<string, unknown>[];
    createResult: { id: string; email: string } | null;
    findQuery: { select: (field: string) => unknown; exec: () => Promise<unknown> } | null;
    tokenPayload: Record<string, unknown> | null;
  } = {
    createCalls: [],
    findCalls: [],
    createResult: null,
    findQuery: null,
    tokenPayload: null,
  };

  const users = {
    create: async (input: Record<string, unknown>) => {
      state.createCalls.push(input);
      if (!state.createResult) throw new Error('Missing create result in test setup.');
      return state.createResult;
    },
    findOne: (filter: Record<string, unknown>) => {
      state.findCalls.push(filter);
      if (!state.findQuery) throw new Error('Missing find query in test setup.');
      return state.findQuery;
    },
  };
  const jwt = {
    signAsync: async (payload: Record<string, unknown>) => {
      state.tokenPayload = payload;
      return 'signed-access-token';
    },
  };
  let service: AuthService;

  beforeEach(() => {
    state.createCalls = [];
    state.findCalls = [];
    state.createResult = null;
    state.findQuery = null;
    state.tokenPayload = null;
    service = new AuthService(
      users as unknown as Model<UserDocument>,
      jwt as unknown as JwtService,
    );
  });

  it('normalizes registration emails, hashes passwords, and returns a signed session', async () => {
    state.createResult = {
      id: 'user-123',
      email: 'person@example.com',
    };

    const result = await service.register({
      email: ' Person@Example.com ',
      password: 'long-enough-password',
    } as CredentialsDto);

    assert.equal(state.createCalls[0].email, 'person@example.com');
    assert.equal(typeof state.createCalls[0].passwordHash, 'string');
    const passwordHash = state.createCalls[0].passwordHash as string;
    assert.equal(await bcrypt.compare('long-enough-password', passwordHash), true);
    assert.deepEqual(result, {
      accessToken: 'signed-access-token',
      user: { id: 'user-123', email: 'person@example.com' },
    });
    assert.deepEqual(state.tokenPayload, {
      sub: 'user-123',
      email: 'person@example.com',
    });
    assert.equal('passwordHash' in result, false);
  });

  it('checks the stored bcrypt hash during login', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    let selectedPassword = false;
    state.findQuery = {
      select: (field) => {
        selectedPassword = field === '+passwordHash';
        return state.findQuery;
      },
      exec: async () => ({
        id: 'user-456',
        email: 'person@example.com',
        passwordHash,
      }),
    };

    const result = await service.login({
      email: 'PERSON@example.com',
      password: 'correct-password',
    } as CredentialsDto);

    assert.deepEqual(state.findCalls, [{ email: 'person@example.com' }]);
    assert.equal(selectedPassword, true);
    assert.deepEqual(result.user, {
      id: 'user-456',
      email: 'person@example.com',
    });
  });

  it('rejects an unknown email or incorrect password', async () => {
    state.findQuery = {
      select: () => state.findQuery,
      exec: async () => null,
    };

    await assert.rejects(
      () =>
        service.login({
          email: 'missing@example.com',
          password: 'long-enough-password',
        } as CredentialsDto),
      UnauthorizedException,
    );
  });
});
