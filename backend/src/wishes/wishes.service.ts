import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}
  async create(user: User, createWishDto: CreateWishDto): Promise<Wish> {
    return await this.wishesRepository.save({
      ...createWishDto,
      owner: user,
    });
  }

  async findAll() {
    return await this.wishesRepository.find();
  }

  getTopCards() {
    return this.wishesRepository.find({
      take: 10,
      order: { copied: 'DESC' },
    });
  }

  getLastCards() {
    return this.wishesRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
    });
  }

  getWishesByUserId(userId: number): Promise<Wish[]> {
    return this.wishesRepository.find({
      where: { owner: { id: userId } },
      relations: ['offers', 'owner'],
    });
  }

  getCardById(id: number): Promise<Wish> {
    return this.wishesRepository.findOne({
      relations: { owner: true, offers: { user: true } },
      where: { id },
    });
  }

  async findOne(queryFilter: FindOneOptions<Wish>) {
    return await this.wishesRepository.findOne(queryFilter);
  }

  async find(queryFilter: FindOneOptions<Wish>) {
    return await this.wishesRepository.find(queryFilter);
  }

  async update(
    id: number,
    userId: number,
    updateWish: UpdateWishDto,
    isRaised = false,
  ) {
    const wishToUpdate = await this.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (isRaised) {
      return this.wishesRepository.update(id, updateWish);
    }
    if (userId !== wishToUpdate.owner.id) {
      throw new Error(
        'Пользователь может отредактировать только описание своих подарков и стоимость',
      );
    }
    if (updateWish.price && wishToUpdate.raised > 0) {
      throw new Error(
        'Пользователь может отредактировать описание своих подарков и стоимость, если только никто ещё не решил скинуться.',
      );
    }
    return this.wishesRepository.update(id, updateWish);
  }

  async remove(id: number, userId: number) {
    const wishToRemove = await this.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (userId !== wishToRemove.owner.id) {
      throw new Error('Пользователь может удалить только своии подарки');
    }
    if (wishToRemove.price && wishToRemove.raised > 0) {
      throw new Error(
        'Пользователь может удалить подарок, если только никто ещё не решил скинуться.',
      );
    }
    this.wishesRepository.delete(id);
    return wishToRemove;
  }

  async copy(wishId: number, user: User) {
    const wishToCopy = await this.findOne({
      where: {
        id: wishId,
      },
      relations: {
        owner: {
          wishes: true,
          wishlists: true,
        },
      },
    });
    if (wishToCopy.owner.id === user.id) {
      throw new Error(
        'Данный подарок нельзя скопировать, так как он у вас уже имеется',
      );
    }
    await this.wishesRepository.update(wishId, { copied: ++wishToCopy.copied });

    const { name, link, image, description, price } = wishToCopy;
    const copiedWish = {
      name,
      description,
      image,
      link,
      price,
      owner: user.id,
    };

    await this.create(user, copiedWish);
    return {};
  }
}
