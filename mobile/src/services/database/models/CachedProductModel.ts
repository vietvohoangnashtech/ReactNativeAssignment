import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export class CachedProductModel extends Model {
  static table = 'cached_products';

  @field('product_id') productId!: number;
  @field('name') name!: string;
  @field('price') price!: number;
  @field('description') description!: string;
  @field('image') image!: string;
  @field('category') category!: string;
  @field('price_unit') priceUnit!: string;
  @field('cached_at') cachedAt!: number;
}
