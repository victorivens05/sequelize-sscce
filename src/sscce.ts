// Require the necessary things from Sequelize
import { Sequelize, Op, Model, DataTypes } from 'sequelize';

// This function should be used instead of `new Sequelize()`.
// It applies the config for your SSCCE to work on CI.
import createSequelizeInstance = require('./utils/create-sequelize-instance');

// This is an utility logger that should be preferred over `console.log()`.
import log = require('./utils/log');

// You can use sinon and chai assertions directly in your SSCCE if you want.
import sinon = require('sinon');
import { expect } from 'chai';

// Your SSCCE goes inside this function.
export async function run() {
  const sequelize = createSequelizeInstance({
    logQueryParameters: true,
    benchmark: true,
    dialect: 'mssql',
    database: 'sscce_order_id_limit',
    username: 'SA',
    password: 'yourStrong(!)Password',
  });

  class Foo extends Model {};
  Foo.init({
    name: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Foo'
  });

  class Bar extends Model {};
  Bar.init({
    name: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Bar'
  })

  Foo.hasMany(Bar);
  Bar.belongsTo(Foo);

  await sequelize.sync();

  await Foo.create({ name: 'Foo 1' });
  await Foo.create({ name: 'Foo 2' });
  await Foo.create({ name: 'Foo 3' });
  await Bar.create({ name: 'Bar 1.1', FooId: 1 });
  await Bar.create({ name: 'Bar 1.2', FooId: 1 });
  await Bar.create({ name: 'Bar 1.3', FooId: 1 });
  await Bar.create({ name: 'Bar 2.1', FooId: 2 });
  await Bar.create({ name: 'Bar 2.2', FooId: 2 });
  await Bar.create({ name: 'Bar 2.3', FooId: 2 });
  await Bar.create({ name: 'Bar 3.1', FooId: 3 });
  await Bar.create({ name: 'Bar 3.2', FooId: 3 });
  await Bar.create({ name: 'Bar 3.3', FooId: 3 });

  console.log(await Bar.findAll({
    where: { id: [1, 2, 4] },
    include: [{
      model: Foo,
    }],
    order: [[ { model: Foo, as: 'Foo' }, 'createdAt', 'DESC']],
    limit: 2,
  }))
}
