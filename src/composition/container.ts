import type { AppConfig } from './config.js';
import type { ITelegramService } from '../domain/ports/ITelegramService.js';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../infrastructure/persistence/PrismaUserRepository.js';
import { PrismaConversationRepository } from '../infrastructure/persistence/PrismaConversationRepository.js';
import { PrismaMessageRepository } from '../infrastructure/persistence/PrismaMessageRepository.js';
import { TelegramApiAdapter } from '../infrastructure/telegram/TelegramApiAdapter.js';
import { JwtTokenService } from '../infrastructure/auth/JwtTokenService.js';
import { BcryptPasswordHasher } from '../infrastructure/auth/BcryptPasswordHasher.js';
import { CryptoIdGenerator } from '../infrastructure/auth/CryptoIdGenerator.js';
import { RandomAutoReplyProvider } from '../infrastructure/auth/RandomAutoReplyProvider.js';
import { RegisterUserUseCase } from '../application/use-cases/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../application/use-cases/LoginUserUseCase.js';
import { ListConversationsUseCase } from '../application/use-cases/ListConversationsUseCase.js';
import { ListConversationMessagesUseCase } from '../application/use-cases/ListConversationMessagesUseCase.js';
import { SendMessageUseCase } from '../application/use-cases/SendMessageUseCase.js';
import { ProcessTelegramUpdatesUseCase } from '../application/use-cases/ProcessTelegramUpdatesUseCase.js';
import { startTelegramPolling } from '../infrastructure/jobs/TelegramPollingJob.js';

export interface Container {
  registerUser: RegisterUserUseCase;
  loginUser: LoginUserUseCase;
  listConversations: ListConversationsUseCase;
  listConversationMessages: ListConversationMessagesUseCase;
  sendMessage: SendMessageUseCase;
  processTelegramUpdates: ProcessTelegramUpdatesUseCase;
  tokenService: JwtTokenService;
  stopTelegramPolling: () => void;
}

/** Opcional: para tests de integración (misma BD, Telegram sin red). */
export interface ContainerOverrides {
  prisma?: PrismaClient;
  telegramService?: ITelegramService;
}

export function createContainer(config: AppConfig, overrides?: ContainerOverrides): Container {
  const prisma = overrides?.prisma ?? new PrismaClient({
    datasources: { db: { url: config.databaseUrl } },
  });
  const userRepo = new PrismaUserRepository(prisma);
  const conversationRepo = new PrismaConversationRepository(prisma);
  const messageRepo = new PrismaMessageRepository(prisma);
  const telegramService = overrides?.telegramService ?? new TelegramApiAdapter(config.botToken);
  const tokenService = new JwtTokenService(config.jwtSecret);
  const passwordHasher = new BcryptPasswordHasher();
  const idGenerator = new CryptoIdGenerator();
  const autoReplyProvider = new RandomAutoReplyProvider(config.autoReplyPhrases);

  const registerUser = new RegisterUserUseCase(userRepo, passwordHasher, idGenerator);
  const loginUser = new LoginUserUseCase(userRepo, passwordHasher, tokenService);
  const listConversations = new ListConversationsUseCase(conversationRepo);
  const listConversationMessages = new ListConversationMessagesUseCase(
    conversationRepo,
    messageRepo
  );
  const sendMessage = new SendMessageUseCase(
    conversationRepo,
    messageRepo,
    telegramService,
    idGenerator
  );
  const processTelegramUpdates = new ProcessTelegramUpdatesUseCase(
    conversationRepo,
    messageRepo,
    telegramService,
    idGenerator,
    autoReplyProvider
  );

  const stopTelegramPolling = config.botToken
    ? startTelegramPolling(processTelegramUpdates, config.telegramPollIntervalMs)
    : () => {};

  return {
    registerUser,
    loginUser,
    listConversations,
    listConversationMessages,
    sendMessage,
    processTelegramUpdates,
    tokenService,
    stopTelegramPolling,
  };
}
