import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export class RecentlyViewedModel extends Model {
  static table = 'recently_viewed';

  @field('product_id') productId!: number;
  @field('name') name!: string;
  @field('price') price!: number;
  @field('image') image!: string;
  @field('price_unit') priceUnit!: string;
  @field('viewed_at') viewedAt!: number;
}
