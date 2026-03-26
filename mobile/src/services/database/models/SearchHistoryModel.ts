import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export class SearchHistoryModel extends Model {
  static table = 'search_history';

  @field('query') query!: string;
  @field('searched_at') searchedAt!: number;
}
