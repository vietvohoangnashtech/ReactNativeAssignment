import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export class CachedOrderModel extends Model {
  static table = 'cached_orders';

  @field('order_id') orderId!: number;
  @field('status') status!: string;
  @field('total_price') totalPrice!: number;
  @field('items_json') itemsJson!: string;
  @field('local_sync_status') localSyncStatus!: string;
  @field('idempotency_key') idempotencyKey!: string;
  @field('cached_at') cachedAt!: number;
}
