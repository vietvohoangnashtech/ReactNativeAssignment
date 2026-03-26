import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export class CachedCategoryModel extends Model {
  static table = 'cached_categories';

  @field('category_id') categoryId!: number;
  @field('name') name!: string;
  @field('cached_at') cachedAt!: number;
}
