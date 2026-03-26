// Global mock for WatermelonDB native bridge
jest.mock('@nozbe/watermelondb/adapters/sqlite', () => {
  return jest.fn().mockImplementation(() => ({
    schema: {},
    migrations: [],
    underlyingAdapter: {
      unsafeSqlQuery: jest.fn(),
    },
  }));
});

jest.mock('@nozbe/watermelondb/Schema', () => ({
  __esModule: true,
  appSchema: jest.fn(conf => conf),
  tableSchema: jest.fn(conf => conf),
}));

jest.mock('@nozbe/watermelondb/Schema/migrations', () => ({
  __esModule: true,
  schemaMigrations: jest.fn(conf => conf),
  createTable: jest.fn(conf => conf),
  addColumns: jest.fn(conf => conf),
}));

jest.mock('@nozbe/watermelondb', () => {
  const mockCollection = {
    query: jest.fn(() => ({
      fetch: jest.fn(() => Promise.resolve([])),
      observe: jest.fn(),
    })),
    find: jest.fn(),
    create: jest.fn(),
  };
  class MockDatabase {
    constructor() {
      this.collections = {get: jest.fn(() => mockCollection)};
    }
    get = jest.fn(() => mockCollection);
    write = jest.fn((fn) => fn());
    batch = jest.fn();
  }
  class MockModel {
    static table = '';
    static associations = {};
  }
  return {
    __esModule: true,
    Database: MockDatabase,
    default: MockDatabase,
    Model: MockModel,
    Q: {
      where: jest.fn(),
      eq: jest.fn(),
      gt: jest.fn(),
      sortBy: jest.fn(),
      take: jest.fn(),
      on: jest.fn(),
    },
    appSchema: jest.fn(conf => conf),
    tableSchema: jest.fn(conf => conf),
  };
});

jest.mock('@nozbe/watermelondb/decorators', () => ({
  __esModule: true,
  field: () => () => {},
  text: () => () => {},
  readonly: () => () => {},
  date: () => () => {},
  children: () => () => {},
  relation: () => () => {},
  immutableRelation: () => () => {},
  json: () => () => {},
  lazy: () => () => {},
  action: () => () => {},
  writer: () => () => {},
  reader: () => () => {},
  nochange: () => () => {},
}));
