var mongodb = require('./db');

function category(category) {
  this.name=category.name;
  this.img=category.img;
};

module.exports = category;

//存储信息
category.prototype.save = function(callback) {
  var category = {
    name:this.name,
    img:this.img
  };
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 cloth 集合
    db.collection('category', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //将用户数据插入 cloth 集合
      collection.insert(category, {
        safe: true
      }, function(err, category) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, category.ops[0]); //成功！err 为 null，并返回存储后的文档
      });
    });
  });
};

category.getAll = function(callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    db.collection('category', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //返回只包含 name、time、title 属性的文档组成的存档数组
      collection.find({
      }).toArray(function(err, category) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, category);
      });
    });
  });
};

category.accurate = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 news 集合
    db.collection('category', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找新闻名（name键）值为 name 一个文档
      collection.findOne({
        name: name
      }, function(error, category) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, category);
      });
    });

  });
};
