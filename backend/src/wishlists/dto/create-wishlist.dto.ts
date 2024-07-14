import {
  IsString,
  Length,
  IsOptional,
  IsUrl,
  MaxLength,
  IsArray,
} from 'class-validator';

export class CreateWishlistDto {
  @Length(1, 250)
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  description: string;

  @IsOptional()
  @IsUrl()
  image: string;

  @IsArray()
  itemsId: Array<number>;
}
