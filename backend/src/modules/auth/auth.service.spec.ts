import { ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
  const jwt = { signAsync: jest.fn().mockResolvedValue('signed-token') };
  const service = new AuthService(prisma as never, jwt as never);

  beforeEach(() => jest.clearAllMocks());

  it('normalizes identity data, hashes the password, and signs a new session', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'u1', name: data.name, email: data.email, createdAt: new Date('2026-01-01') }),
    );

    const result = await service.signup({ name: '  Ada Lovelace  ', email: ' ADA@EXAMPLE.COM ', password: 'ValidPass1!' });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'ada@example.com' }, select: { id: true } });
    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data.name).toBe('Ada Lovelace');
    expect(data.email).toBe('ada@example.com');
    expect(data.passwordHash).not.toBe('ValidPass1!');
    await expect(bcrypt.compare('ValidPass1!', data.passwordHash)).resolves.toBe(true);
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1' });
    expect(result.token).toBe('signed-token');
  });

  it('rejects a duplicate normalized email without creating an account', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(service.signup({ name: 'Ada', email: ' ADA@example.com ', password: 'ValidPass1!' })).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('logs in a user with a case-insensitive email and valid password', async () => {
    const passwordHash = await bcrypt.hash('ValidPass1!', 4);
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', name: 'Ada', email: 'ada@example.com', passwordHash, createdAt: new Date('2026-01-01') });
    const result = await service.login({ email: ' ADA@EXAMPLE.COM ', password: 'ValidPass1!' });
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.token).toBe('signed-token');
  });

  it.each([
    ['missing account', null, 'ValidPass1!'],
    ['wrong password', { id: 'u1', passwordHash: '$2b$04$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid' }, 'wrong'],
  ])('rejects login for a %s', async (_label, user, password) => {
    prisma.user.findUnique.mockResolvedValue(user);
    await expect(service.login({ email: 'ada@example.com', password })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns the public profile and never exposes the password hash', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', name: 'Ada', email: 'ada@example.com', createdAt: new Date('2026-01-01') });
    const profile = await service.profile('u1');
    expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'u1' } }));
    expect(profile).not.toHaveProperty('passwordHash');
  });

  it('rejects a profile lookup after its account is removed', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.profile('removed')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
