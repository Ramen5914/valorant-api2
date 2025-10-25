import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { ExternalService } from 'src/external/external.service';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private readonly externalService: ExternalService,
  ) {}

  async createPlayerWithApi(name: string, tag: string): Promise<Account> {
    const account = await this.externalService.getAccountByName(name, tag);

    const newAccount = this.accountRepository.create({
      id: account.puuid,
      name: account.name,
      tag: account.tag,
      playerCard: account.card,
      title: account.title,
      accountLevel: account.account_level,
      region: account.region,
    });

    return this.accountRepository.save(newAccount);
  }

  async createPlayer(
    id: string,
    name: string,
    tag: string,
    playerCard: string,
    title: string,
    accountLevel: number,
    region: string,
  ): Promise<Account> {
    return this.accountRepository.save({
      id,
      name,
      tag,
      playerCard,
      title,
      accountLevel,
      region,
    });
  }

  async updatePlayer(
    account: {
      id: string;
      name: string;
      tag: string;
      playerCard: string;
      title: string;
      levelBorder?: string;
      accountLevel: number;
      premier: {
        rosterId?: string;
        showTag?: boolean;
        showPlating?: boolean;
      };
      region: string;
    },
    matchStartTime: Date,
  ): Promise<Account> {
    // Try to find existing account
    const existingAccount = await this.accountRepository.findOne({
      where: { id: account.id },
    });

    if (existingAccount && existingAccount.lastMatch < matchStartTime) {
      existingAccount.name = account.name;
      existingAccount.tag = account.tag;
      existingAccount.playerCard = account.playerCard;
      existingAccount.title = account.title;
      existingAccount.accountLevel = account.accountLevel;
      existingAccount.preferredLevelBorder = account.levelBorder ?? null;
      existingAccount.region = account.region;
      existingAccount.lastMatch = matchStartTime;

      existingAccount.rosterId = account.premier.rosterId ?? null;
      existingAccount.showTag = account.premier.showTag ?? null;
      existingAccount.showPlating = account.premier.showPlating ?? null;

      return this.accountRepository.save(existingAccount);
    }

    // If account exists but was updated after startTime, return it without changes
    if (existingAccount) {
      return existingAccount;
    }

    // If account doesn't exist, create a new one
    const newAccount = this.accountRepository.create({
      id: account.id,
      name: account.name,
      tag: account.tag,
      playerCard: account.playerCard,
      title: account.title,
      accountLevel: account.accountLevel,
      preferredLevelBorder: account.levelBorder ?? null,
      region: account.region,
      lastMatch: matchStartTime,
    });

    newAccount.rosterId = account.premier.rosterId ?? null;
    newAccount.showTag = account.premier.showTag ?? null;
    newAccount.showPlating = account.premier.showPlating ?? null;

    return this.accountRepository.save(newAccount);
  }

  async getAccountById(id: string): Promise<Account | null> {
    return this.accountRepository.findOne({ where: { id } });
  }
}
