import {schemaMigrations, createTable} from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 4,
      steps: [
        createTable({
          name: 'cached_products',
          columns: [
            {name: 'product_id', type: 'number'},
            {name: 'name', type: 'string'},
            {name: 'price', type: 'number'},
            {name: 'description', type: 'string', isOptional: true},
            {name: 'image', type: 'string', isOptional: true},
            {name: 'category', type: 'string'},
            {name: 'price_unit', type: 'string'},
            {name: 'cached_at', type: 'number'},
          ],
        }),
        createTable({
          name: 'cached_categories',
          columns: [
            {name: 'category_id', type: 'number'},
            {name: 'name', type: 'string'},
            {name: 'cached_at', type: 'number'},
          ],
        }),
        createTable({
          name: 'cached_orders',
          columns: [
            {name: 'order_id', type: 'number', isOptional: true},
            {name: 'status', type: 'string'},
            {name: 'total_price', type: 'number'},
            {name: 'items_json', type: 'string'},
            {name: 'local_sync_status', type: 'string'},
            {name: 'idempotency_key', type: 'string'},
            {name: 'cached_at', type: 'number'},
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        createTable({
          name: 'sync_operations',
          columns: [
            {name: 'entity_type', type: 'string'},
            {name: 'entity_id', type: 'string'},
            {name: 'operation', type: 'string'},
            {name: 'payload', type: 'string'},
            {name: 'created_at', type: 'number'},
            {name: 'retry_count', type: 'number'},
            {name: 'status', type: 'string'},
            {name: 'idempotency_key', type: 'string'},
          ],
        }),
      ],
    },
    {
      toVersion: 2,
      steps: [
        createTable({
          name: 'search_history',
          columns: [
            {name: 'query', type: 'string'},
            {name: 'searched_at', type: 'number'},
          ],
        }),
        createTable({
          name: 'recently_viewed',
          columns: [
            {name: 'product_id', type: 'number'},
            {name: 'name', type: 'string'},
            {name: 'price', type: 'number'},
            {name: 'image', type: 'string', isOptional: true},
            {name: 'price_unit', type: 'string'},
            {name: 'viewed_at', type: 'number'},
          ],
        }),
      ],
    },
  ],
});
