import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export class CartItemModel extends Model {
  static table = 'cart_items';

  // `!` is justified: WatermelonDB's @field decorator provides the value at runtime
  @field('product_id') productId!: number;
  @field('name') name!: string;
  @field('price') price!: number;
  @field('image') image!: string;
  @field('quantity') quantity!: number;
}
