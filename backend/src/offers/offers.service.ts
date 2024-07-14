import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private wishesService: WishesService,
  ) {}

  async create(user: User, createOfferDto: CreateOfferDto): Promise<Offer> {
    const wish = await this.wishesService.findOne({
      where: { id: createOfferDto.itemId },
      relations: {
        owner: {
          wishes: true,
          wishlists: true,
        },
      },
    });
    if (user.id === wish.owner.id) {
      throw new Error('Нельзя вносить деньги на собственные подарки.');
    }
    if (wish.price - wish.raised < createOfferDto.amount) {
      throw new Error(
        'Сумма собранных средств не может превышать стоимость подарка.',
      );
    }
    await this.wishesService.update(
      wish.id,
      user.id,
      {
        ...wish,
        raised: wish.raised + createOfferDto.amount,
      },
      true,
    );

    return this.offersRepository.save({
      ...createOfferDto,
      user,
      item: wish,
    });
  }
}
