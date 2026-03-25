import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export class ProfileModel extends Model {
  static table = 'profiles';

  // `!` is justified: WatermelonDB's @field decorator provides the value at runtime
  @field('user_id') userId!: number;
  @field('username') username!: string;
  @field('email') email!: string;
  @field('age') age!: number;
  @field('first_name') firstName!: string;
  @field('last_name') lastName!: string;
  @field('role') role!: string;
}
