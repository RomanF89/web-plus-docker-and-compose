import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishList } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(WishList)
    private wishlistRepository: Repository<WishList>,
  ) {}
  async create(createWishListDto: CreateWishlistDto, userId: number) {
    const { itemsId } = createWishListDto;
    const wishListItems = itemsId.map((id) => ({ id }));
    const wishList = this.wishlistRepository.create({
      ...createWishListDto,
      items: wishListItems,
      owner: { id: userId },
    });

    return this.wishlistRepository.save(wishList);
  }

  async findAll(query: FindManyOptions<WishList>) {
    return await this.wishlistRepository.find(query);
  }
  async findOne(query: FindOneOptions<WishList>) {
    return await this.wishlistRepository.findOne(query);
  }

  async updateWishlist(
    id: number,
    userId: number,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<WishList> {
    const wishList = await this.findOne({
      where: { id },
      relations: { owner: true, items: true },
    });
    const wishes = await this.findAll({
      relations: { owner: true, items: true },
    });

    if (wishList.owner.id !== userId) {
      throw new Error(
        'Пользователь может редактировать только свой список подарков',
      );
    }

    return await this.wishlistRepository.save({
      ...wishList,
      items: wishes,
      name: updateWishlistDto.name,
      image: updateWishlistDto.image,
      description: updateWishlistDto.description,
    });
  }

  async remove(id: number, userId: number) {
    const wishList = await this.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (wishList.owner.id !== userId) {
      throw new Error('Пользователь может удалить только свой список подарков');
    }
    await this.wishlistRepository.delete(id);
    return {};
  }
}
