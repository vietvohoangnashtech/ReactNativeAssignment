import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'profiles',
      columns: [
        {name: 'user_id', type: 'number'},
        {name: 'username', type: 'string'},
        {name: 'email', type: 'string'},
        {name: 'age', type: 'number'},
        {name: 'first_name', type: 'string'},
        {name: 'last_name', type: 'string'},
        {name: 'role', type: 'string'},
      ],
    }),
    tableSchema({
      name: 'cart_items',
      columns: [
        {name: 'product_id', type: 'number'},
        {name: 'name', type: 'string'},
        {name: 'price', type: 'number'},
        {name: 'image', type: 'string', isOptional: true},
        {name: 'quantity', type: 'number'},
      ],
    }),
  ],
});
