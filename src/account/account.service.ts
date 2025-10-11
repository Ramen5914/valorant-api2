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

  async getAccountById(id: string): Promise<Account | null> {
    return this.accountRepository.findOne({ where: { id } });
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.accountRepository.find();
  }
}
