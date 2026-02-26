import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../../src/infrastructure/persistence/PrismaUserRepository.js';
import { PrismaConversationRepository } from '../../src/infrastructure/persistence/PrismaConversationRepository.js';
import { PrismaMessageRepository } from '../../src/infrastructure/persistence/PrismaMessageRepository.js';
import { User } from '../../src/domain/entities/User.js';
import { Conversation } from '../../src/domain/entities/Conversation.js';
import { Message } from '../../src/domain/entities/Message.js';
import { UserId } from '../../src/domain/value-objects/UserId.js';
import { Email } from '../../src/domain/value-objects/Email.js';
import { TelegramChatId } from '../../src/domain/value-objects/TelegramChatId.js';
import { MessageContent } from '../../src/domain/value-objects/MessageContent.js';
import {
  TEST_DATABASE_URL,
  setupTestDatabase,
  getTestPrisma,
  cleanTestDatabase,
} from '../helpers/testDb.js';

describe('Repositories integration', () => {
  let prisma: PrismaClient;
  let userRepo: PrismaUserRepository;
  let conversationRepo: PrismaConversationRepository;
  let messageRepo: PrismaMessageRepository;

  beforeAll(() => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    setupTestDatabase();
    prisma = getTestPrisma();
    userRepo = new PrismaUserRepository(prisma);
    conversationRepo = new PrismaConversationRepository(prisma);
    messageRepo = new PrismaMessageRepository(prisma);
  });

  afterEach(async () => {
    await cleanTestDatabase();
  });

  describe('PrismaUserRepository', () => {
    it('save y findByEmail devuelve el usuario guardado', async () => {
      const user = new User(
        new UserId('user-repo-1'),
        new Email('repo@test.com'),
        'hashedPassword'
      );
      await userRepo.save(user);
      const found = await userRepo.findByEmail(new Email('repo@test.com'));
      expect(found).not.toBeNull();
      expect(found!.id.value).toBe('user-repo-1');
      expect(found!.email.value).toBe('repo@test.com');
    });

    it('findById devuelve null si no existe', async () => {
      const found = await userRepo.findById(new UserId('no-existe'));
      expect(found).toBeNull();
    });

    it('findByEmail devuelve null si no existe', async () => {
      const found = await userRepo.findByEmail(new Email('nadie@test.com'));
      expect(found).toBeNull();
    });
  });

  describe('PrismaConversationRepository', () => {
    it('save y findById devuelve la conversación', async () => {
      const conv = new Conversation(
        'conv-repo-1',
        new TelegramChatId('987654321'),
        new Date()
      );
      await conversationRepo.save(conv);
      const found = await conversationRepo.findById('conv-repo-1');
      expect(found).not.toBeNull();
      expect(found!.telegramChatId.value).toBe('987654321');
    });

    it('findByTelegramChatId devuelve la conversación', async () => {
      const conv = new Conversation(
        'conv-repo-2',
        new TelegramChatId('111222333'),
        new Date()
      );
      await conversationRepo.save(conv);
      const found = await conversationRepo.findByTelegramChatId(new TelegramChatId('111222333'));
      expect(found).not.toBeNull();
      expect(found!.id).toBe('conv-repo-2');
    });

    it('list devuelve todas las conversaciones ordenadas por createdAt desc', async () => {
      await conversationRepo.save(
        new Conversation('c1', new TelegramChatId('1'), new Date('2024-01-01'))
      );
      await conversationRepo.save(
        new Conversation('c2', new TelegramChatId('2'), new Date('2024-01-02'))
      );
      const list = await conversationRepo.list();
      expect(list.length).toBe(2);
      expect(list[0].id).toBe('c2');
      expect(list[1].id).toBe('c1');
    });
  });

  describe('PrismaMessageRepository', () => {
    it('save y findByConversationId devuelve los mensajes', async () => {
      await conversationRepo.save(
        new Conversation('conv-msg-1', new TelegramChatId('555'), new Date())
      );
      const msg1 = new Message(
        'msg-1',
        'conv-msg-1',
        new MessageContent('Texto uno'),
        'in',
        new Date()
      );
      const msg2 = new Message(
        'msg-2',
        'conv-msg-1',
        new MessageContent('Texto dos'),
        'out',
        new Date()
      );
      await messageRepo.save(msg1);
      await messageRepo.save(msg2);
      const messages = await messageRepo.findByConversationId('conv-msg-1');
      expect(messages.length).toBe(2);
      expect(messages.map((m) => m.content.value)).toContain('Texto uno');
      expect(messages.map((m) => m.content.value)).toContain('Texto dos');
    });

    it('findById devuelve el mensaje o null', async () => {
      await conversationRepo.save(
        new Conversation('conv-msg-2', new TelegramChatId('666'), new Date())
      );
      const msg = new Message(
        'msg-unico',
        'conv-msg-2',
        new MessageContent('Hola'),
        'in',
        new Date()
      );
      await messageRepo.save(msg);
      const found = await messageRepo.findById('msg-unico');
      expect(found).not.toBeNull();
      expect(found!.content.value).toBe('Hola');
      const notFound = await messageRepo.findById('no-existe');
      expect(notFound).toBeNull();
    });
  });
});
