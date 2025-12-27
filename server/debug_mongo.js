const MongoStore = require('connect-mongo');
console.log('MongoStore type:', typeof MongoStore);
console.log('MongoStore keys:', Object.keys(MongoStore));
console.log('Has create?', typeof MongoStore.create);
if (MongoStore.default) {
    console.log('Has default?', true);
    console.log('Default keys:', Object.keys(MongoStore.default));
    console.log('Default create?', typeof MongoStore.default.create);
}
